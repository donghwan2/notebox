import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Which required env vars are missing, if any.
 *
 * These are inlined at BUILD time, so a deploy whose build ran without them
 * ships a broken bundle. Never throw here: a module-scope throw stops React
 * from mounting at all and the user just gets a blank page. Report it instead
 * and let the UI render something readable.
 */
export const missingSupabaseEnv: string[] = [
  !supabaseUrl && 'VITE_SUPABASE_URL',
  !supabaseKey && 'VITE_SUPABASE_PUBLISHABLE_KEY',
].filter(Boolean) as string[];

export const isSupabaseConfigured = missingSupabaseEnv.length === 0;

if (!isSupabaseConfigured) {
  console.error(
    `[NoteBox] Supabase 환경변수 누락: ${missingSupabaseEnv.join(', ')}. ` +
      '로컬은 .env.local, 배포는 호스팅 환경변수에 설정한 뒤 다시 빌드해야 합니다.'
  );
}

// Placeholders keep createClient from throwing; the UI gates on isSupabaseConfigured.
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
