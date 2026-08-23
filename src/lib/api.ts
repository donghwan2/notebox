import { supabase } from './supabase';
import type { ArchiveItemRow, CategoryRow } from './database.types';
import type { ArchiveItem, ArchiveType, Category } from '../App';

const IMAGE_BUCKET = 'archive-images';

/** 'YYYY.MM.DD HH:mm' — the format the UI already renders. */
function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function rowToItem(row: ArchiveItemRow): ArchiveItem {
  return {
    id: row.id,
    type: row.type as ArchiveType,
    category: row.category_id ?? 'none',
    tags: row.tags ?? [],
    content: row.content,
    description: row.description,
    isFavorite: row.is_favorite,
    createdAt: formatCreatedAt(row.created_at),
    timestamp: new Date(row.created_at).getTime(),
  };
}

function rowToCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, icon: row.icon };
}

/** The app uses the sentinel 'none' where the DB uses NULL. */
function toCategoryId(category: string | undefined): string | null {
  return !category || category === 'none' ? null : category;
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('로그인이 필요합니다.');
  return data.user.id;
}

/* ------------------------------------------------------------------ auth */

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export type UserProfile = {
  id: string;
  email: string;
  createdAt: string | null;
  lastSignInAt: string | null;
};

export async function getCurrentUser(): Promise<UserProfile | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? '',
    createdAt: data.user.created_at ?? null,
    lastSignInAt: data.user.last_sign_in_at ?? null,
  };
}

export function onAuthStateChange(cb: (userId: string | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user.id ?? null);
  });
  return () => data.subscription.unsubscribe();
}

/* ------------------------------------------------------------ categories */

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToCategory);
}

export async function createCategory(name: string, icon: string): Promise<Category> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: userId, name, icon, sort_order: 100 })
    .select()
    .single();
  if (error) throw error;
  return rowToCategory(data);
}

export async function updateCategory(
  id: string,
  patch: { name?: string; icon?: string }
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToCategory(data);
}

/** Items in this category fall back to NULL ('none') via ON DELETE SET NULL. */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

/* ---------------------------------------------------------- archive items */

export async function fetchItems(): Promise<ArchiveItem[]> {
  const { data, error } = await supabase
    .from('archive_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToItem);
}

export type NewItemInput = {
  type: ArchiveType;
  category: string;
  tags: string[];
  content: string;
  description: string;
};

export async function createItem(input: NewItemInput): Promise<ArchiveItem> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('archive_items')
    .insert({
      user_id: userId,
      category_id: toCategoryId(input.category),
      type: input.type,
      tags: input.tags,
      content: input.content,
      description: input.description,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToItem(data);
}

export async function updateItem(
  id: string,
  patch: Partial<NewItemInput> & { isFavorite?: boolean }
): Promise<ArchiveItem> {
  const { data, error } = await supabase
    .from('archive_items')
    .update({
      ...(patch.type !== undefined && { type: patch.type }),
      ...(patch.category !== undefined && { category_id: toCategoryId(patch.category) }),
      ...(patch.tags !== undefined && { tags: patch.tags }),
      ...(patch.content !== undefined && { content: patch.content }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.isFavorite !== undefined && { is_favorite: patch.isFavorite }),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToItem(data);
}

export async function setFavorite(id: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('archive_items')
    .update({ is_favorite: isFavorite })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('archive_items').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteItems(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from('archive_items').delete().in('id', ids);
  if (error) throw error;
}

/* --------------------------------------------------------------- storage */

/**
 * Uploads an image to the private bucket and returns a long-lived signed URL.
 * Storing files here keeps base64 blobs out of Postgres rows.
 */
export async function uploadImage(file: File): Promise<{ path: string; url: string }> {
  const userId = await requireUserId();
  const ext = file.name.split('.').pop() || 'png';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (error) throw error;

  return { path, url: data.signedUrl };
}

/** Re-signs a stored object path — signed URLs expire. */
export async function signImageUrl(path: string, expiresInSeconds = 60 * 60): Promise<string> {
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  if (error) throw error;
}

/* ------------------------------------------------- localStorage migration */

/**
 * One-time import of the existing localStorage archive into Supabase.
 * Old category ids ('work', 'cat_123') are remapped to the new uuid rows by name.
 */
export async function migrateFromLocalStorage(): Promise<{ categories: number; items: number }> {
  const userId = await requireUserId();

  const rawCats = localStorage.getItem('omnivault_categories_v4');
  const rawItems = localStorage.getItem('omnivault_items_v4');
  if (!rawCats && !rawItems) return { categories: 0, items: 0 };

  const localCats: Category[] = rawCats ? JSON.parse(rawCats) : [];
  const localItems: ArchiveItem[] = rawItems ? JSON.parse(rawItems) : [];

  const existing = await fetchCategories();
  const byName = new Map(existing.map((c) => [c.name, c.id]));
  const oldToNew = new Map<string, string>();

  for (const cat of localCats) {
    let newId = byName.get(cat.name);
    if (!newId) {
      const created = await createCategory(cat.name, cat.icon);
      newId = created.id;
      byName.set(cat.name, newId);
    }
    oldToNew.set(cat.id, newId);
  }

  const rows = localItems.map((item) => ({
    user_id: userId,
    category_id: oldToNew.get(item.category) ?? null,
    type: item.type,
    tags: item.tags ?? [],
    content: item.content,
    description: item.description,
    is_favorite: item.isFavorite,
    created_at: new Date(item.timestamp ?? Date.now()).toISOString(),
  }));

  if (rows.length > 0) {
    const { error } = await supabase.from('archive_items').insert(rows);
    if (error) throw error;
  }

  localStorage.setItem('omnivault_migrated_v4', new Date().toISOString());
  return { categories: oldToNew.size, items: rows.length };
}
