import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Folder,
  Plus,
  Search,
  FileText,
  Link2,
  Image as ImageIcon,
  Tag,
  Star,
  Trash2,
  ExternalLink,
  Grid,
  List,
  Sparkles,
  CheckCircle2,
  Copy,
  Upload,
  Layers,
  FolderPlus,
  X,
  ChevronDown,
  ChevronRight,
  History,
  Clock,
  RefreshCw,
  Lightbulb,
  Check,
  Calendar,
  Edit3,
  Save,
  Download,
  Play,
  Youtube,
  Menu,
  AlertCircle,
  User,
  LogIn
} from 'lucide-react';
import * as api from './lib/api';
import { useAuth } from './auth';
import ProfileDashboard from './ProfileDashboard';
import ConfirmDialog, { type ConfirmRequest } from './ConfirmDialog';

export type ArchiveType = 'text' | 'link' | 'image';

export interface ArchiveItem {
  id: string;
  type: ArchiveType;
  category: string;
  tags: string[];
  content: string; // Text body, URL, or Base64 Image
  description: string; // The sentence entered by user
  isFavorite: boolean;
  createdAt: string;
  timestamp?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface TagSet {
  id: string;
  title: string;
  description?: string;
  tags: string[];
}

export function getYoutubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const regExp = /(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

export function getYoutubeThumbnail(url: string): string | null {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function detectContentType(content: string, imagePreview: string): ArchiveType {
  if (imagePreview && imagePreview.trim().length > 0) return 'image';
  const trimmed = (content || '').trim();
  if (!trimmed) return 'text';
  if (trimmed.startsWith('data:image/')) return 'image';

  // If multi-line, it's a text memo
  if (trimmed.includes('\n')) return 'text';

  const urlPattern = /^(https?:\/\/|www\.)[^\s]+$/i;
  const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/i;
  const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;

  if (urlPattern.test(trimmed) || youtubePattern.test(trimmed) || (!trimmed.includes(' ') && domainPattern.test(trimmed))) {
    return 'link';
  }

  return 'text';
}

export function NoteBoxLogo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Apple Style Smooth Diagonal Violet/Purple Gradients */}
        <linearGradient id="gb-apple-leaf" x1="0.1" y1="0.8" x2="0.9" y2="0.2">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="60%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#E9D5FF" />
        </linearGradient>

        <linearGradient id="gb-apple-berry-1" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="40%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        <linearGradient id="gb-apple-berry-2" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="45%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        <linearGradient id="gb-apple-berry-3" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="50%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>

        <linearGradient id="gb-apple-berry-bottom" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="60%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>

        {/* Soft Modern Glow */}
        <filter id="gb-apple-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#8B5CF6" floodOpacity="0.45" />
        </filter>
      </defs>

      <g filter="url(#gb-apple-glow)">
        {/* Leaf on Top Right (Apple icon tilted aesthetic) */}
        <path
          d="M48 24 C48 13, 59 4, 67 5 C67 15, 59 23, 48 24 Z"
          fill="url(#gb-apple-leaf)"
        />

        {/* 8 Geometric Grape Circles scaled up nicely to fill the icon */}
        {/* Row 1 (Top: 2 berries) */}
        <circle cx="42" cy="33" r="8" fill="url(#gb-apple-berry-1)" />
        <circle cx="59.5" cy="33" r="8" fill="url(#gb-apple-berry-1)" />

        {/* Row 2 (Middle: 3 berries) */}
        <circle cx="33.5" cy="47.5" r="8" fill="url(#gb-apple-berry-2)" />
        <circle cx="50.75" cy="47.5" r="8" fill="url(#gb-apple-berry-2)" />
        <circle cx="68" cy="47.5" r="8" fill="url(#gb-apple-berry-2)" />

        {/* Row 3 (Lower: 2 berries) */}
        <circle cx="42" cy="62" r="8" fill="url(#gb-apple-berry-3)" />
        <circle cx="59.5" cy="62" r="8" fill="url(#gb-apple-berry-3)" />

        {/* Row 4 (Bottom Point: 1 berry) */}
        <circle cx="50.75" cy="75.5" r="7.5" fill="url(#gb-apple-berry-bottom)" />
      </g>
    </svg>
  );
}


// Default categories are seeded per-user in Postgres by the
// `handle_new_user` trigger on signup, not here.

/**
 * Failures that clear by themselves — a token whose `iat` is a hair ahead of
 * the API's clock, or a dropped connection — so retrying is worthwhile.
 */
function isTransientLoadError(err: any): boolean {
  const msg = String(err?.message ?? err ?? '').toLowerCase();
  return (
    msg.includes('issued at future') ||
    msg.includes('jwt') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed')
  );
}

function describeLoadError(err: any): string {
  const raw = String(err?.message ?? err ?? '');
  if (raw.toLowerCase().includes('issued at future')) {
    // The token's iat comes from the auth server, so this is a momentary skew
    // between Supabase's own services rather than anything the user set.
    return '인증 토큰이 일시적으로 거부됐습니다. 잠시 후 저절로 해결되는 문제이니 다시 시도해 주세요.';
  }
  return raw || '데이터를 불러오지 못했습니다.';
}

/** Matches the archive-images bucket's per-file limit. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Longest first so "에서는" wins over "는". */
const MULTI_PARTICLES = [
  '이라고', '에서는', '에게서', '으로는', '이라는',
  '에서', '으로', '에게', '한테', '까지', '부터', '보다', '처럼', '라고',
];
const SINGLE_PARTICLES = ['은', '는', '이', '가', '을', '를', '에', '의', '도', '과', '와', '로', '만'];

/**
 * Trims a trailing Korean particle so "회사에서" becomes "회사".
 *
 * Deliberately conservative. Multi-syllable particles are unambiguous, but a
 * single one cannot be told apart from a word that simply ends that way —
 * "세상이" and "고양이" have identical shapes. So a single-syllable particle is
 * only removed when the stem ends in a non-Hangul character ("ai가" -> "ai"),
 * where it cannot be part of the word. Everything else is left intact:
 * a tag with an extra syllable beats one that lost its meaning.
 *
 * Gemini produces the real tags; this only runs when that call is unavailable.
 */
export function stripParticles(word: string): string {
  if (!/[가-힣]$/.test(word)) return word;

  for (const p of MULTI_PARTICLES) {
    if (word.endsWith(p) && word.length - p.length >= 2) return word.slice(0, -p.length);
  }

  for (const p of SINGLE_PARTICLES) {
    if (!word.endsWith(p)) continue;
    const stem = word.slice(0, -1);
    if (stem.length >= 2 && !/[가-힣]$/.test(stem)) return stem;
  }

  return word;
}

function fallbackExtractTags(text: string): string[] {
  if (!text || !text.trim()) return [];
  const raw = text.trim();
  const stopWords = new Set([
    '이', '그', '저', '것', '수', '등', '및', '를', '을', '에', '에서', '으로', '로',
    '과', '와', '은', '는', '이것', '저것', '그것', '대해', '위해', '대한', '관한',
    '너무', '아주', '매우', '진짜', '정말', '참', '조금', '다시', '항상', '자주',
    '합니다', '하고', '있는', '없는', '된다', '하는', '때', '내가', '우리가'
  ]);

  const words = raw
    .replace(/[#@,./!?;:()[\]{}"'“”~…·\\|\n\r]/g, ' ')
    .split(/\s+/)
    .map((w) => stripParticles(w.trim()))
    .filter((w) => w.length >= 2 && !stopWords.has(w) && !/^\d+$/.test(w));

  return Array.from(new Set(words)).slice(0, 5);
}

const EXAMPLE_SENTENCES = [
  '직장에서 탁월한 사람의 특징 3가지',
  '주말에 가기 좋은 감성 오션뷰 카페 리스트',
  'Next.js와 TypeScript 기반의 웹 프론트엔드 성능 최적화 방법',
  '매일 아침 10분 스트레칭과 건강한 수면 루틴 계획',
];

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const { userId, profile, ready: authReady, openLogin, signOut, requireAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  /** Bumped by the retry button to re-run the load effect. */
  const [reloadKey, setReloadKey] = useState(0);
  /** Signed URLs for images kept in Storage, keyed by their `storage:` ref. */
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  /** Picked files, uploaded on submit so cancelling leaves no orphans. */
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editPendingFile, setEditPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);

  /** Wraps a destructive action in the confirm dialog. */
  const askConfirm = (req: Omit<ConfirmRequest, 'onConfirm'>, action: () => void) => {
    setConfirmRequest({
      ...req,
      onConfirm: () => {
        setConfirmRequest(null);
        action();
      },
    });
  };

  /**
   * The URL to actually render for an item's image. Storage refs resolve
   * through the signed-URL map; legacy base64 and external URLs pass through.
   */
  const imageSrc = (content: string): string =>
    api.isStorageRef(content) ? signedUrls[content] ?? '' : content;

  // Helper to safely get category name
  const getCategoryName = (catId?: string) => {
    if (!catId || catId === 'none') return '카테고리 없음';
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : '카테고리 없음';
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<ArchiveType | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyHistory, setOnlyHistory] = useState(false);
  const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ArchiveItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ArchiveItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for new item - default to 'none' (카테고리 없음)
  const [newType, setNewType] = useState<ArchiveType>('text');
  const [newCategory, setNewCategory] = useState<string>('none');
  const [newContent, setNewContent] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [aiTagSource, setAiTagSource] = useState<'ai' | 'heuristic' | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Form states for edit item
  const [editType, setEditType] = useState<ArchiveType>('text');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editContent, setEditContent] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editCustomTagInput, setEditCustomTagInput] = useState('');
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [isEditGeneratingTags, setIsEditGeneratingTags] = useState(false);
  const [editAiTagSource, setEditAiTagSource] = useState<'ai' | 'heuristic' | null>(null);
  const [isEditDraggingOver, setIsEditDraggingOver] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const editDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Form states for new category
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📁');
  const [catError, setCatError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = 'NoteBox';
    const setFavicon = () => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/svg+xml';
      link.href = '/favicon.svg';
    };
    setFavicon();
  }, []);

  // Load the archive whenever the signed-in user changes. Signed out there is
  // nothing to read — RLS scopes every row to its owner — so show an empty shell.
  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    if (!userId) {
      setCategories([]);
      setItems([]);
      setSelectedItemIds([]);
      setSelectedDetailItem(null);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    (async () => {
      try {
        const hasLegacy =
          !localStorage.getItem('omnivault_migrated_v4') &&
          (localStorage.getItem('omnivault_items_v4') ||
            localStorage.getItem('omnivault_categories_v4'));

        if (hasLegacy) {
          try {
            await api.migrateFromLocalStorage();
          } catch (err) {
            console.warn('localStorage 마이그레이션 실패, 건너뜁니다:', err);
          }
        }

        // A freshly minted token can be a moment ahead of the API's clock
        // ("JWT issued at future"), and a cold start can drop the first call.
        // Both clear on their own, so retry before showing a dead end.
        let lastErr: any;
        for (let attempt = 0; attempt < 4; attempt++) {
          if (attempt > 0) {
            await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
            if (cancelled) return;
          }
          try {
            const [cats, list] = await Promise.all([api.fetchCategories(), api.fetchItems()]);
            if (cancelled) return;
            setCategories(cats);
            setItems(list);
            setLoadError(null);

            // Older rows inlined their image as base64; move those to Storage.
            api
              .migrateInlineImages(list)
              .then(({ migrated, failed }) => {
                if (cancelled || migrated.length === 0) return;
                const byId = new Map(migrated.map((m) => [m.id, m]));
                setItems((prev) => prev.map((i) => byId.get(i.id) ?? i));
                showToast(
                  `이미지 ${migrated.length}개를 저장소로 옮겼습니다.` +
                    (failed > 0 ? ` (${failed}개 실패)` : '')
                );
              })
              .catch((err) => console.warn('[NoteBox] 이미지 이전 실패:', err));
            return;
          } catch (err: any) {
            lastErr = err;
            if (!isTransientLoadError(err)) break;
            console.warn(`[NoteBox] 로드 재시도 ${attempt + 1}/4:`, err?.message ?? err);
          }
        }
        throw lastErr;
      } catch (err: any) {
        if (!cancelled) setLoadError(describeLoadError(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, authReady, reloadKey]);

  // Storage-backed images need a signed URL before they can be rendered.
  useEffect(() => {
    const missing = Array.from(
      new Set<string>(
        items
          .filter((i) => i.type === 'image' && api.isStorageRef(i.content))
          .map((i) => i.content)
          .filter((ref) => !signedUrls[ref])
      )
    );
    if (missing.length === 0) return;

    let cancelled = false;
    api
      .signImageRefs(missing)
      .then((map) => {
        if (!cancelled && Object.keys(map).length > 0) {
          setSignedUrls((prev) => ({ ...prev, ...map }));
        }
      })
      .catch((err) => console.warn('[NoteBox] 이미지 URL 서명 실패:', err));

    return () => {
      cancelled = true;
    };
  }, [items, signedUrls]);

  // Don't let a stale validation message greet the user next time they open it.
  useEffect(() => {
    if (!isCategoryModalOpen) setCatError(null);
  }, [isCategoryModalOpen]);

  // Handle ESC key to close any open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmRequest) {
          setConfirmRequest(null);
        } else if (isProfileOpen) {
          setIsProfileOpen(false);
        } else if (isCategoryModalOpen) {
          setIsCategoryModalOpen(false);
        } else if (isEditModalOpen) {
          setIsEditModalOpen(false);
          setEditingItem(null);
        } else if (isAddModalOpen) {
          setIsAddModalOpen(false);
        } else if (selectedDetailItem) {
          setSelectedDetailItem(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    confirmRequest,
    isProfileOpen,
    isCategoryModalOpen,
    isEditModalOpen,
    isAddModalOpen,
    selectedDetailItem,
  ]);

  // AI Smart Tag Generation function
  const fetchAITags = async (text: string, catId: string, type: string) => {
    if (!text || !text.trim() || text.trim().length < 3) {
      setTags([]);
      setAiTagSource(null);
      setIsGeneratingTags(false);
      return;
    }

    const catName = getCategoryName(catId);
    setIsGeneratingTags(true);

    try {
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: text.trim(),
          categoryName: catName,
          contentType: type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
          setTags(data.tags);
          setAiTagSource('ai');
          setIsGeneratingTags(false);
          return;
        }
      }
      const fallback = fallbackExtractTags(text);
      setTags(fallback);
      setAiTagSource('heuristic');
    } catch (err) {
      console.warn('AI Tag generation request failed, using fallback:', err);
      const fallback = fallbackExtractTags(text);
      setTags(fallback);
      setAiTagSource('heuristic');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const val = e.target.value;
    setNewDescription(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length >= 4) {
      setIsGeneratingTags(true);
      debounceTimerRef.current = setTimeout(() => {
        const detected = detectContentType(newContent, imagePreview);
        fetchAITags(val, newCategory, detected);
      }, 600);
    } else {
      setTags([]);
      setAiTagSource(null);
      setIsGeneratingTags(false);
    }
  };

  // Open Edit Modal with selected item's data
  const openEditModal = (item: ArchiveItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setEditType(item.type);
    setEditCategory(item.category || 'none');
    setEditContent(item.content);
    setEditDescription(item.description);
    setEditTags(item.tags || []);
    setEditCustomTagInput('');
    setEditImagePreview(item.type === 'image' ? imageSrc(item.content) : '');
    setEditPendingFile(null);
    setIsUploading(false);
    setIsEditGeneratingTags(false);
    setEditAiTagSource(null);
    setIsEditModalOpen(true);
  };

  // Edit AI Tag fetcher
  const fetchEditAITags = async (text: string, catId: string, type: string) => {
    if (!text || !text.trim() || text.trim().length < 3) {
      return;
    }
    const catName = getCategoryName(catId);
    setIsEditGeneratingTags(true);
    setEditAiTagSource(null);

    try {
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: text.trim(),
          categoryName: catName,
          contentType: type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
          setEditTags(data.tags);
          setEditAiTagSource('ai');
          setIsEditGeneratingTags(false);
          return;
        }
      }
      const fallbackTags = fallbackExtractTags(text);
      if (fallbackTags.length > 0) {
        setEditTags(fallbackTags);
        setEditAiTagSource('heuristic');
      }
    } catch {
      const fallbackTags = fallbackExtractTags(text);
      if (fallbackTags.length > 0) {
        setEditTags(fallbackTags);
        setEditAiTagSource('heuristic');
      }
    } finally {
      setIsEditGeneratingTags(false);
    }
  };

  const handleEditDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const val = e.target.value;
    setEditDescription(val);

    if (editDebounceTimerRef.current) {
      clearTimeout(editDebounceTimerRef.current);
    }

    if (val.trim().length >= 4) {
      setIsEditGeneratingTags(true);
      editDebounceTimerRef.current = setTimeout(() => {
        const detected = detectContentType(editContent, editImagePreview);
        fetchEditAITags(val, editCategory, detected);
      }, 600);
    } else {
      setIsEditGeneratingTags(false);
    }
  };

  const handleEditImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(PNG, JPG, WebP 등)만 업로드 가능합니다.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert(`이미지 크기는 ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB 이하만 가능합니다.`);
      return;
    }
    setEditPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setEditImagePreview(result);
      setEditContent(result);
    };
    reader.readAsDataURL(file);
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleEditImageFile(file);
    }
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsEditDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setEditType('image');
      handleEditImageFile(e.dataTransfer.files[0]);
    }
  };

  const addEditCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editCustomTagInput.trim().replace(/^#/, '');
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed]);
      setEditCustomTagInput('');
    }
  };

  const removeEditTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!requireAuth()) return;

    if (!editContent.trim() && !editImagePreview) {
      alert('저장할 내용을 입력하거나 이미지를 선택해 주세요.');
      return;
    }

    const detectedType = detectContentType(editContent, editImagePreview);
    let finalContent = editContent.trim();
    if (detectedType === 'image' && editImagePreview) {
      if (editPendingFile) {
        setIsUploading(true);
        try {
          finalContent = await api.uploadImage(editPendingFile);
        } catch (err: any) {
          setIsUploading(false);
          alert(`이미지 업로드에 실패했습니다: ${err?.message ?? err}`);
          return;
        }
        setIsUploading(false);
      } else {
        // Unchanged image: keep whatever reference the row already had.
        finalContent = editingItem.type === 'image' ? editingItem.content : editImagePreview;
      }
    } else if (detectedType === 'link' && !/^https?:\/\//i.test(finalContent)) {
      if (!finalContent.startsWith('http://') && !finalContent.startsWith('https://')) {
        finalContent = `https://${finalContent}`;
      }
    }

    const finalDescription =
      editDescription.trim() ||
      (detectedType === 'text'
        ? finalContent.slice(0, 60).replace(/\n/g, ' ')
        : detectedType === 'link'
        ? '저장된 웹 링크 북마크'
        : '저장된 이미지 파일');

    const finalTags = editTags.length > 0 ? editTags : fallbackExtractTags(finalDescription);

    try {
      const updatedItem = await api.updateItem(editingItem.id, {
        type: detectedType,
        category: editCategory,
        tags: finalTags,
        content: finalContent,
        description: finalDescription,
      });

      setItems((prev) => prev.map((item) => (item.id === editingItem.id ? updatedItem : item)));

      // Also update selectedDetailItem if it's currently opened
      if (selectedDetailItem?.id === editingItem.id) {
        setSelectedDetailItem(updatedItem);
      }

      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(`수정에 실패했습니다: ${err?.message ?? err}`);
    }
  };

  const downloadImage = (url: string, description: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanFileName = (description.trim() || 'image')
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, '_')
      .slice(0, 100);

    // If it's a data url
    if (url.startsWith('data:')) {
      const mime = url.split(',')[0].split(':')[1]?.split(';')[0] || 'image/png';
      const ext = mime.split('/')[1] || 'png';
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cleanFileName}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // If external url, try fetching as blob to trigger direct named download
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const ext = blob.type.split('/')[1] || 'png';
        link.download = `${cleanFileName}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        // Fallback
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cleanFileName}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id || 'detail');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(PNG, JPG, WebP 등)만 업로드 가능합니다.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert(`이미지 크기는 ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB 이하만 가능합니다.`);
      return;
    }
    // The data URL is only a local preview; the file itself goes to Storage on save.
    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setNewContent(result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setNewType('image');
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const clipItems = e.clipboardData?.items;
    if (clipItems) {
      for (let i = 0; i < clipItems.length; i++) {
        if (clipItems[i].type.indexOf('image') !== -1) {
          const blob = clipItems[i].getAsFile();
          if (blob) {
            setNewType('image');
            handleImageFile(blob);
            break;
          }
        }
      }
    }
  };

  const addCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCustomTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!newContent.trim() && !imagePreview) {
      alert('저장할 내용을 입력하거나 이미지를 선택해 주세요.');
      return;
    }

    const detectedType = detectContentType(newContent, imagePreview);

    let finalContent = newContent.trim();
    if (detectedType === 'image' && imagePreview) {
      // Upload to Storage and keep only the reference in the row.
      if (pendingFile) {
        setIsUploading(true);
        try {
          finalContent = await api.uploadImage(pendingFile);
        } catch (err: any) {
          setIsUploading(false);
          alert(`이미지 업로드에 실패했습니다: ${err?.message ?? err}`);
          return;
        }
        setIsUploading(false);
      } else {
        finalContent = imagePreview;
      }
    } else if (detectedType === 'link' && !/^https?:\/\//i.test(finalContent)) {
      if (!finalContent.startsWith('http://') && !finalContent.startsWith('https://')) {
        finalContent = `https://${finalContent}`;
      }
    }

    const finalDescription =
      newDescription.trim() ||
      (detectedType === 'text'
        ? finalContent.slice(0, 60).replace(/\n/g, ' ')
        : detectedType === 'link'
        ? '저장된 웹 링크 북마크'
        : '저장된 이미지 파일');

    const finalTags = tags.length > 0 ? tags : fallbackExtractTags(finalDescription);

    try {
      const saved = await api.createItem({
        type: detectedType,
        category: newCategory || 'none',
        tags: finalTags,
        content: finalContent,
        description: finalDescription,
      });
      setItems((prev) => [saved, ...prev]);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert(`저장에 실패했습니다: ${err?.message ?? err}`);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    if (!requireAuth()) return;

    setCatError(null);

    // Names are unique per user in Postgres; check here first so the user gets
    // an instant, readable message instead of a constraint violation.
    if (categories.some((c) => c.name.trim().toLowerCase() === name.toLowerCase())) {
      setCatError('이미 존재하는 카테고리 입니다.');
      return;
    }

    try {
      const newCat = await api.createCategory(name, newCatIcon.trim() || '📁');
      setCategories((prev) => [...prev, newCat]);
      setNewCategory(newCat.id);
      setNewCatName('');
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      // 23505 = unique_violation, in case the row was created elsewhere meanwhile.
      if (err?.code === '23505') {
        setCatError('이미 존재하는 카테고리 입니다.');
        return;
      }
      setCatError(`카테고리 생성에 실패했습니다: ${err?.message ?? err}`);
    }
  };

  const handleDeleteCategory = (catId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!requireAuth()) return;

    const cat = categories.find((c) => c.id === catId);
    const affected = items.filter((item) => item.category === catId).length;

    askConfirm(
      {
        title: '이 카테고리를 삭제할까요?',
        message:
          affected > 0
            ? `이 카테고리의 항목 ${affected}개는 삭제되지 않고 '카테고리 없음'으로 이동합니다.`
            : '이 카테고리에 속한 항목은 없습니다.',
        detail: cat ? `${cat.icon} ${cat.name}` : undefined,
        confirmLabel: '카테고리 삭제',
      },
      () => performDeleteCategory(catId)
    );
  };

  const performDeleteCategory = async (catId: string) => {
    try {
      // ON DELETE SET NULL moves the orphaned items to 'none' server-side.
      await api.deleteCategory(catId);
    } catch (err: any) {
      alert(`카테고리 삭제에 실패했습니다: ${err?.message ?? err}`);
      return;
    }

    const remainingCats = categories.filter((c) => c.id !== catId);

    // Change all items that belonged to this deleted category to 'none' ('카테고리 없음')
    setItems((prev) =>
      prev.map((item) => (item.category === catId ? { ...item, category: 'none' } : item))
    );

    // Update categories list
    setCategories(remainingCats);

    // Reset active selections if needed
    if (selectedCategory === catId) {
      setSelectedCategory('all');
    }
    if (newCategory === catId) {
      setNewCategory('none');
    }
    if (editCategory === catId) {
      setEditCategory('none');
    }
  };

  const resetForm = () => {
    setPendingFile(null);
    setIsUploading(false);
    setNewType('text');
    setNewCategory('none');
    setNewContent('');
    setNewDescription('');
    setTags([]);
    setCustomTagInput('');
    setImagePreview('');
    setIsGeneratingTags(false);
    setAiTagSource(null);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth()) return;
    const current = items.find((item) => item.id === id);
    if (!current) return;
    const next = !current.isFavorite;

    // Optimistic — roll back if the write fails.
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isFavorite: next } : item)));

    try {
      await api.setFavorite(id, next);
    } catch (err: any) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isFavorite: !next } : item))
      );
      showToast(`즐겨찾기 변경에 실패했습니다: ${err?.message ?? err}`);
    }
  };

  const toggleSelectItem = (id: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const deleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!requireAuth()) return;
    const target = items.find((item) => item.id === id);
    askConfirm(
      {
        title: '이 항목을 삭제할까요?',
        message: '아카이브에서 영구히 사라집니다.',
        detail: target?.description,
        confirmLabel: '삭제',
      },
      () => performDeleteItem(id)
    );
  };

  const performDeleteItem = async (id: string) => {
    const snapshot = items;
    const target = items.find((i) => i.id === id);

    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItemIds((prev) => prev.filter((itemId) => itemId !== id));
    if (selectedDetailItem?.id === id) {
      setSelectedDetailItem(null);
    }

    try {
      await api.deleteItem(id);
      if (target && api.isStorageRef(target.content)) {
        api.deleteImage(target.content).catch((err) =>
          console.warn('[NoteBox] 이미지 파일 정리 실패:', err)
        );
      }
      showToast('아카이브 항목이 삭제되었습니다.');
    } catch (err: any) {
      setItems(snapshot);
      showToast(`삭제에 실패했습니다: ${err?.message ?? err}`);
    }
  };

  const deleteSelectedItems = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!requireAuth()) return;
    if (selectedItemIds.length === 0) return;

    const targetIds = [...selectedItemIds];
    askConfirm(
      {
        title: `선택한 ${targetIds.length}개 항목을 삭제할까요?`,
        message: '선택한 항목이 모두 아카이브에서 영구히 사라집니다.',
        confirmLabel: `${targetIds.length}개 삭제`,
      },
      () => performDeleteSelectedItems(targetIds)
    );
  };

  const performDeleteSelectedItems = async (targetIds: string[]) => {
    const count = targetIds.length;
    const snapshot = items;

    setItems((prev) => prev.filter((item) => !targetIds.includes(item.id)));
    if (selectedDetailItem && targetIds.includes(selectedDetailItem.id)) {
      setSelectedDetailItem(null);
    }
    setSelectedItemIds([]);

    try {
      await api.deleteItems(targetIds);
      for (const item of snapshot) {
        if (targetIds.includes(item.id) && api.isStorageRef(item.content)) {
          api.deleteImage(item.content).catch((err) =>
            console.warn('[NoteBox] 이미지 파일 정리 실패:', err)
          );
        }
      }
      showToast(`선택한 ${count}개 항목이 일괄 삭제되었습니다.`);
    } catch (err: any) {
      setItems(snapshot);
      setSelectedItemIds(targetIds);
      showToast(`일괄 삭제에 실패했습니다: ${err?.message ?? err}`);
    }
  };

  const copyToClipboard = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sort items strictly by newest first for history
  const sortedHistoryItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const timeA = a.timestamp || new Date(a.createdAt.replace(/\./g, '-')).getTime() || 0;
      const timeB = b.timestamp || new Date(b.createdAt.replace(/\./g, '-')).getTime() || 0;
      return timeB - timeA;
    });
  }, [items]);

  // Collect all unique tags across items for sidebar filter
  const allUniqueTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filteredItems = useMemo(() => {
    const list = items.filter((item) => {
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'none') {
          const isCatNone = !item.category || item.category === 'none' || !categories.some((c) => c.id === item.category);
          if (!isCatNone) return false;
        } else if (item.category !== selectedCategory) {
          return false;
        }
      }
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      if (selectedTag && !item.tags.includes(selectedTag)) {
        return false;
      }
      if (onlyFavorites && !item.isFavorite) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchContent = item.content.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        return matchContent || matchDesc || matchTags;
      }
      return true;
    });

    // Always sort latest items first (descending by timestamp / creation date / ID)
    return [...list].sort((a, b) => {
      const timeA = a.timestamp ?? (Number(a.id) > 100000000 ? Number(a.id) : (new Date(a.createdAt.replace(/\./g, '-')).getTime() || Number(a.id) || 0));
      const timeB = b.timestamp ?? (Number(b.id) > 100000000 ? Number(b.id) : (new Date(b.createdAt.replace(/\./g, '-')).getTime() || Number(b.id) || 0));
      return timeB - timeA;
    });
  }, [items, categories, selectedCategory, selectedType, selectedTag, onlyFavorites, searchQuery]);

  const countsByType = useMemo(() => {
    return {
      all: items.length,
      text: items.filter((i) => i.type === 'text').length,
      link: items.filter((i) => i.type === 'link').length,
      image: items.filter((i) => i.type === 'image').length,
    };
  }, [items]);

  const selectedInCurrentCount = useMemo(() => {
    const currentFilteredIds = new Set(filteredItems.map((item) => item.id));
    return selectedItemIds.filter((id) => currentFilteredIds.has(id)).length;
  }, [filteredItems, selectedItemIds]);

  const isAllCurrentSelected = useMemo(() => {
    return (
      filteredItems.length > 0 &&
      filteredItems.every((item) => selectedItemIds.includes(item.id))
    );
  }, [filteredItems, selectedItemIds]);

  const handleSelectAll = (e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    const currentFilteredIds = filteredItems.map((item) => item.id);
    if (isAllCurrentSelected) {
      // Deselect all items that are in the current filtered view
      setSelectedItemIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    } else {
      // Select all items that are in the current filtered view
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-950 text-slate-400">
        <NoteBoxLogo className="w-14 h-14 animate-pulse drop-shadow-[0_0_18px_rgba(168,85,247,0.45)]" />
        <p className="text-sm">아카이브를 불러오는 중…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center">
        <NoteBoxLogo className="w-12 h-12 opacity-70" />
        <p className="text-sm text-rose-300 max-w-sm leading-relaxed">{loadError}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            다시 시도
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden select-none relative">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Collapsible + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-slate-900/98 border-r border-slate-800/90 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out md:static ${
          isMobileSidebarOpen
            ? 'translate-x-0 shadow-2xl shadow-purple-950/80'
            : '-translate-x-full md:translate-x-0'
        } ${isSidebarOpen ? 'md:w-72 md:opacity-100' : 'md:w-0 md:border-r-0 md:opacity-0 md:pointer-events-none md:overflow-hidden'}`}
      >
        {/* App Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <NoteBoxLogo className="w-10 h-10 flex-shrink-0 drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]" />
            <div className="truncate">
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-300 via-pink-200 to-indigo-200 bg-clip-text text-transparent">
                NoteBox
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Desktop Sidebar Collapse Button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="사이드바 닫기"
              aria-label="사이드바 닫기"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="메뉴 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Button & Fixed All Archives Button */}
        <div className="p-4 pb-3 space-y-2 border-b border-slate-800/80 flex-shrink-0">
          <button
            onClick={() => {
              if (!requireAuth()) return;
              resetForm();
              setIsAddModalOpen(true);
              setIsMobileSidebarOpen(false);
            }}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 rounded-xl font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>새로 만들기</span>
          </button>

          {/* Fixed '모든 아카이브' button (Always visible, unaffected by scroll) */}
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
              setSelectedTag(null);
              setOnlyFavorites(false);
              setSearchQuery('');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              selectedCategory === 'all' && selectedType === 'all' && !onlyFavorites && !selectedTag && !searchQuery
                ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-slate-800/90 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>모든 아카이브</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono transition-colors ${
                selectedCategory === 'all' && selectedType === 'all' && !onlyFavorites && !selectedTag && !searchQuery
                  ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/50'
              }`}
            >
              {items.length}
            </span>
          </button>
        </div>

        {/* Navigation & Filters (Scrollable area) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Main Filters Section */}
          <div className="space-y-1">
            <div className="px-3 py-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.6)]"></span>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                빠른 필터
              </span>
            </div>

            {/* Favorites */}
            <button
              onClick={() => {
                const nextFav = !onlyFavorites;
                setOnlyFavorites(nextFav);
                if (nextFav) {
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setSelectedTag(null);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                onlyFavorites
                  ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>즐겨찾기</span>
              </div>
              <span className="text-xs bg-slate-800/80 px-2 py-0.5 rounded-full text-slate-400 border border-slate-700/50">
                {items.filter((i) => i.isFavorite).length}
              </span>
            </button>

            {/* === USER REQUESTED: HISTORY DROPDOWN SECTION === */}
            <div className="pt-1">
              <button
                onClick={() => setIsHistoryDropdownOpen(!isHistoryDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer group ${
                  isHistoryDropdownOpen
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-medium">history</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">
                    {items.length}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isHistoryDropdownOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </div>
              </button>

              {/* History Dropdown Items (Sorted by Newest First) */}
              {isHistoryDropdownOpen && (
                <div className="mt-1.5 ml-2 pl-2 border-l-2 border-indigo-500/30 space-y-1 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
                  {sortedHistoryItems.length === 0 ? (
                    <div className="px-2 py-2 text-[11px] text-slate-500 text-center">
                      히스토리가 없습니다
                    </div>
                  ) : (
                    sortedHistoryItems.map((hItem) => {
                      const catObj = categories.find((c) => c.id === hItem.category);
                      return (
                        <div
                          key={hItem.id}
                          onClick={() => setSelectedDetailItem(hItem)}
                          className="group/h flex flex-col gap-0.5 p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-all border border-transparent hover:border-slate-700/60"
                        >
                          <p className="text-xs text-slate-300 font-medium truncate group-hover/h:text-indigo-300 transition-colors">
                            {hItem.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="truncate">{catObj?.name}</span>
                            <span>•</span>
                            <span className="text-slate-400 flex-shrink-0">
                              {hItem.createdAt.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Type Filters */}
          <div className="space-y-1">
            <div className="px-3 py-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.6)]"></span>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                타입별 모아보기
              </span>
            </div>
            <button
              onClick={() => {
                const nextType = selectedType === 'text' ? 'all' : 'text';
                setSelectedType(nextType);
                if (nextType !== 'all') {
                  setOnlyFavorites(false);
                  setSelectedCategory('all');
                  setSelectedTag(null);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                selectedType === 'text'
                  ? 'bg-blue-600/20 text-blue-300 font-medium border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>텍스트 메모</span>
              </div>
              <span className="text-xs text-slate-500">{countsByType.text}</span>
            </button>

            <button
              onClick={() => {
                const nextType = selectedType === 'link' ? 'all' : 'link';
                setSelectedType(nextType);
                if (nextType !== 'all') {
                  setOnlyFavorites(false);
                  setSelectedCategory('all');
                  setSelectedTag(null);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                selectedType === 'link'
                  ? 'bg-purple-600/20 text-purple-300 font-medium border border-purple-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>웹 링크 (URL)</span>
              </div>
              <span className="text-xs text-slate-500">{countsByType.link}</span>
            </button>

            <button
              onClick={() => {
                const nextType = selectedType === 'image' ? 'all' : 'image';
                setSelectedType(nextType);
                if (nextType !== 'all') {
                  setOnlyFavorites(false);
                  setSelectedCategory('all');
                  setSelectedTag(null);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                selectedType === 'image'
                  ? 'bg-pink-600/20 text-pink-300 font-medium border border-pink-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>이미지 파일</span>
              </div>
              <span className="text-xs text-slate-500">{countsByType.image}</span>
            </button>
          </div>

          {/* Categories Sidebar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.6)]"></span>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  카테고리
                </span>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>새 카테고리</span>
              </button>
            </div>

            {categories.map((cat) => {
              const count = items.filter((i) => i.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    const nextCat = isSelected ? 'all' : cat.id;
                    setSelectedCategory(nextCat);
                    if (nextCat !== 'all') {
                      setOnlyFavorites(false);
                      setSelectedType('all');
                      setSelectedTag(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white font-medium border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 flex-shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}

            {/* '카테고리 없음' always at the bottom of the list */}
            {(() => {
              const uncategorizedCount = items.filter(
                (i) => !i.category || i.category === 'none' || !categories.some((c) => c.id === i.category)
              ).length;
              const isSelected = selectedCategory === 'none';
              return (
                <button
                  onClick={() => {
                    const nextCat = isSelected ? 'all' : 'none';
                    setSelectedCategory(nextCat);
                    if (nextCat !== 'all') {
                      setOnlyFavorites(false);
                      setSelectedType('all');
                      setSelectedTag(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white font-medium border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate pr-2 text-slate-400 flex items-center gap-1.5">
                    <span>카테고리 없음</span>
                  </span>
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 flex-shrink-0">
                    {uncategorizedCount}
                  </span>
                </button>
              );
            })()}
          </div>

          {/* AI Generated Tags Cloud */}
          {allUniqueTags.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between px-3 py-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.6)]"></span>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                    tags
                  </span>
                </div>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    필터 해제
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 px-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                {allUniqueTags.map(([tag, count]) => {
                  const isActive = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        const nextTag = isActive ? null : tag;
                        setSelectedTag(nextTag);
                        if (nextTag !== null) {
                          setOnlyFavorites(false);
                          setSelectedCategory('all');
                          setSelectedType('all');
                        }
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-500 font-medium shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      <span>#{tag}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Profile — pinned to the bottom of the sidebar */}
        <button
          onClick={() => {
            setIsMobileSidebarOpen(false);
            if (userId) setIsProfileOpen(true);
            else openLogin();
          }}
          className="flex-shrink-0 m-3 mt-2 px-2.5 py-2 flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/70 hover:border-slate-700 transition-all text-left cursor-pointer group"
          title={userId ? '내 프로필 & 대시보드' : '로그인'}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md ${
              userId
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-purple-900/30'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}
          >
            {userId ? (
              (profile?.email?.[0] ?? '·').toUpperCase()
            ) : (
              <User className="w-4 h-4" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-slate-200 truncate group-hover:text-white transition-colors">
              {userId ? profile?.email ?? '…' : '로그인'}
            </span>
            <span className="block text-[10px] text-slate-500">
              {userId ? `아카이브 ${items.length}개` : '기록을 저장하려면 로그인하세요'}
            </span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Desktop Sidebar Toggle Button (when sidebar is closed) */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden md:flex p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex-shrink-0 cursor-pointer shadow-sm active:scale-95 items-center justify-center"
                title="사이드바 열기"
                aria-label="사이드바 열기"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 3v18" />
                </svg>
              </button>
            )}

            {/* Mobile Sidebar Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex-shrink-0 cursor-pointer shadow-sm active:scale-95"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 min-w-0 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="설명 문장, AI 태그(#), 링크 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all truncate"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Top Category Dropdown & View Mode */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Category Filter Dropdown - compact on mobile */}
            <div className="relative hidden xs:block sm:block">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategory(val);
                  if (val !== 'all') {
                    setOnlyFavorites(false);
                    setSelectedType('all');
                    setSelectedTag(null);
                  }
                }}
                className="appearance-none bg-slate-900 border border-slate-800 text-[11px] sm:text-xs font-medium text-slate-200 rounded-xl pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-1.5 sm:py-2 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm hover:border-slate-700 transition-colors max-w-[120px] sm:max-w-none truncate"
              >
                <option value="all">전체 ({items.length})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({items.filter((i) => i.category === cat.id).length})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 sm:p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="그리드 뷰"
                aria-label="그리드 뷰"
              >
                <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="리스트 뷰 (최신순 내림차순 정렬)"
                aria-label="리스트 뷰 (최신순 내림차순 정렬)"
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 scrollbar-thin scrollbar-thumb-slate-800 pb-20 md:pb-6">
          {/* Active Filter Badges */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[11px] sm:text-xs">
              <span className="font-semibold text-slate-400">필터:</span>
              <span className="bg-slate-900 text-slate-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                <span>카테고리: {selectedCategory === 'all' ? '전체' : getCategoryName(selectedCategory)}</span>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-slate-400 hover:text-white cursor-pointer ml-0.5"
                    title="전체 카테고리로 보기"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
              {selectedType !== 'all' && (
                <span className="bg-indigo-500/20 text-indigo-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-indigo-500/30 flex items-center gap-1.5">
                  <span>타입: {selectedType === 'text' ? '텍스트' : selectedType === 'link' ? '링크' : '이미지'}</span>
                  <button onClick={() => setSelectedType('all')} className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="bg-purple-500/20 text-purple-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-purple-500/30 flex items-center gap-1.5">
                  <span>태그: #{selectedTag}</span>
                  <button onClick={() => setSelectedTag(null)} className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {onlyFavorites && (
                <span className="bg-amber-500/20 text-amber-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5">
                  <span>즐겨찾기만</span>
                  <button onClick={() => setOnlyFavorites(false)} className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <span className="text-slate-500 ml-1">총 {filteredItems.length}개</span>
            </div>

            {/* Right Actions: Select All & Bulk Delete Toolbar & Category Delete */}
            {filteredItems.length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Select All Checkbox Button */}
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    isAllCurrentSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                  title={isAllCurrentSelected ? '전체 선택 해제' : '전체 선택'}
                >
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="hidden sm:inline">전체 선택</span>
                  {selectedInCurrentCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-500/30 text-indigo-200 font-semibold">
                      {selectedInCurrentCount}
                    </span>
                  )}
                </button>

                {/* Bulk Delete Button */}
                {selectedInCurrentCount > 0 && (
                  <button
                    type="button"
                    onClick={deleteSelectedItems}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/40 text-xs font-semibold transition-all shadow-sm cursor-pointer animate-in fade-in"
                    title={`선택한 ${selectedInCurrentCount}개 항목 일괄 삭제`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>일괄 삭제 ({selectedInCurrentCount})</span>
                  </button>
                )}

                {/* Category Delete Button (Appears when a specific custom category is active) */}
                {selectedCategory !== 'all' && selectedCategory !== 'none' && categories.some((c) => c.id === selectedCategory) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(selectedCategory)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-medium transition-all shadow-sm flex-shrink-0 cursor-pointer group"
                    title={`'${getCategoryName(selectedCategory)}' 카테고리 삭제`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    <span className="hidden sm:inline">카테고리 삭제</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Items Display */}
          {filteredItems.length === 0 ? (
            <div className="h-80 sm:h-96 flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-slate-800 rounded-2xl sm:rounded-3xl bg-slate-900/30">
              <div className="mb-3 sm:mb-4">
                <NoteBoxLogo className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_0_16px_rgba(168,85,247,0.4)] opacity-90" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-300 mb-1">
                {userId ? '바구니에 담긴 아카이브 항목이 없습니다' : 'NoteBox에 오신 것을 환영합니다'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-5 sm:mb-6">
                {userId
                  ? '새 항목을 업로드하고 설명 문장을 입력해보세요. AI가 핵심 태그를 스마트하게 자동 생성합니다.'
                  : '텍스트 메모, 웹 링크, 이미지를 한곳에 모아두는 개인 아카이브입니다. 로그인하면 기록이 저장되고 어느 기기에서나 이어집니다.'}
              </p>
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {userId ? (
                  <>
                    <Plus className="w-4 h-4" />
                    새로 만들기
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    로그인하고 시작하기
                  </>
                )}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredItems.map((item) => {
                const isImage = item.type === 'image' && item.content;
                const ytThumbnail = item.type === 'link' ? getYoutubeThumbnail(item.content) : null;
                const previewSrc = isImage ? imageSrc(item.content) : ytThumbnail!;
                // A storage image has no src until its signed URL arrives.
                const hasPreview = Boolean(previewSrc);
                const isSelected = selectedItemIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDetailItem(item)}
                    className={`group border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-indigo-950/25 border-indigo-500/60 shadow-md shadow-indigo-950/30'
                        : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-indigo-500/50'
                    }`}
                  >
                    {hasPreview ? (
                      <div>
                        {/* Image / YouTube Preview Container */}
                        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 mb-3 group-hover:border-slate-700 transition-colors">
                          <img
                            src={previewSrc}
                            alt={item.description}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {/* Type badge & Checkbox */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <div
                              onClick={(e) => toggleSelectItem(item.id, e)}
                              className="p-1 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-800/60 shadow-md hover:bg-slate-900 cursor-pointer flex items-center justify-center"
                              title={isSelected ? '선택 해제' : '선택'}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => toggleSelectItem(item.id, e)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-3.5 h-3.5 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-500"
                              />
                            </div>
                            {isImage ? (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-800/60 text-[10px] font-medium text-pink-300 shadow-md flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-pink-400" />
                                이미지
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-red-950/85 backdrop-blur-md border border-red-800/60 text-[10px] font-medium text-red-300 shadow-md flex items-center gap-1">
                                <Youtube className="w-3 h-3 text-red-400" />
                                YouTube
                              </span>
                            )}
                          </div>

                          {/* YouTube Play Overlay Icon */}
                          {ytThumbnail && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-950/60 group-hover:scale-110 group-hover:bg-red-500 transition-all">
                                <Play className="w-4 h-4 fill-white translate-x-0.5" />
                              </div>
                            </div>
                          )}

                          {/* Action buttons (Trash & Favorite) on preview */}
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => deleteItem(item.id, e)}
                              className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-950/90 text-slate-300 hover:text-rose-400 backdrop-blur-md transition-colors cursor-pointer border border-slate-800/60 shadow-md"
                              title="삭제 (휴지통)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-300 backdrop-blur-md transition-colors cursor-pointer border border-slate-800/60 shadow-md"
                              title="즐겨찾기"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  item.isFavorite ? 'fill-amber-400 text-amber-400' : 'hover:text-amber-300'
                               }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm font-medium text-slate-100 line-clamp-2 leading-relaxed group-hover:text-indigo-300 transition-colors">
                          {item.description}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {/* Top: Memo Format Icon + Checkbox & Actions */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              onClick={(e) => toggleSelectItem(item.id, e)}
                              className="p-1 rounded hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                              title={isSelected ? '선택 해제' : '선택'}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => toggleSelectItem(item.id, e)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-3.5 h-3.5 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-500"
                              />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 shadow-inner">
                              {item.type === 'text' && <FileText className="w-4 h-4 text-blue-400" />}
                              {item.type === 'link' && <Link2 className="w-4 h-4 text-purple-400" />}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => deleteItem(item.id, e)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="삭제 (휴지통)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                              title="즐겨찾기"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  item.isFavorite ? 'fill-amber-400 text-amber-400' : 'hover:text-amber-300'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Memo Description */}
                        <p className="text-sm font-medium text-slate-100 line-clamp-3 leading-relaxed group-hover:text-indigo-300 transition-colors">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Bottom Metadata */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/50 text-[11px] text-slate-500">
                      <span className="truncate">
                        {getCategoryName(item.category)}
                      </span>
                      <span className="flex-shrink-0 text-slate-500 font-mono">
                        {item.createdAt.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const isImage = item.type === 'image' && item.content;
                const ytThumbnail = item.type === 'link' ? getYoutubeThumbnail(item.content) : null;
                const previewSrc = isImage ? imageSrc(item.content) : ytThumbnail!;
                // A storage image has no src until its signed URL arrives.
                const hasPreview = Boolean(previewSrc);
                const isSelected = selectedItemIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDetailItem(item)}
                    className={`group border rounded-xl p-3 flex items-center justify-between gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/25 border-indigo-500/60 shadow-md shadow-indigo-950/30'
                        : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Checkbox for selection */}
                      <div
                        onClick={(e) => toggleSelectItem(item.id, e)}
                        className="p-1 -m-1 rounded hover:bg-slate-800/80 flex items-center justify-center cursor-pointer flex-shrink-0"
                        title={isSelected ? '선택 해제' : '선택'}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectItem(item.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-500"
                        />
                      </div>

                      {hasPreview ? (
                        <div className="w-14 h-11 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 shadow-inner relative group/thumb">
                          <img
                            src={previewSrc}
                            alt={item.description}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                          {ytThumbnail && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                              <div className="w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow">
                                <Play className="w-2.5 h-2.5 fill-white translate-x-0.5" />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 shadow-inner">
                          {item.type === 'text' && <FileText className="w-4 h-4 text-blue-400" />}
                          {item.type === 'link' && <Link2 className="w-4 h-4 text-purple-400" />}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-slate-200 truncate block group-hover:text-indigo-300">
                          {item.description}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span>{getCategoryName(item.category)}</span>
                          <span>•</span>
                          <span className="font-mono">{item.createdAt.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions: Individual Trash Delete & Favorite Star */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => deleteItem(item.id, e)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer group/trash"
                        title="삭제 (휴지통)"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-4 h-4 group-hover/trash:scale-110 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                        title="즐겨찾기"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            item.isFavorite ? 'fill-amber-400 text-amber-400' : 'hover:text-amber-300'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Floating Action Button (FAB) */}
        <button
          onClick={() => {
            if (!requireAuth()) return;
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="md:hidden fixed bottom-6 right-5 z-30 w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-purple-950/90 flex items-center justify-center border border-indigo-400/40 active:scale-95 transition-transform cursor-pointer"
          aria-label="새 항목 아카이빙"
          title="새 항목 아카이빙"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </main>

      {/* Add New Archive Item Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsAddModalOpen(false)}
          onPaste={handlePaste}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] cursor-default"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-900/90">
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                새 항목 아카이빙
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateItem} className="p-6 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 flex-1">
              {/* 1. Category Dropdown Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    1. 카테고리 선택 (드롭다운)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>새 카테고리 추가</span>
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      if (newDescription.trim().length >= 4) {
                        const detected = detectContentType(newContent, imagePreview);
                        fetchAITags(newDescription, e.target.value, detected);
                      }
                    }}
                    className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors pr-10"
                  >
                    <option value="none">카테고리 없음</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Unified Content Input (Auto Detection: URL / Text / Image) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>2. 콘텐츠 입력</span>
                    <span className="text-slate-500 font-normal hidden sm:inline">(URL · 메모 · 이미지 자동인식)</span>
                  </label>

                  {/* Real-time Dynamic Detection Badge */}
                  {imagePreview ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm animate-in fade-in">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>이미지 파일 자동인식</span>
                    </span>
                  ) : detectContentType(newContent, imagePreview) === 'link' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm animate-in fade-in">
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{getYoutubeThumbnail(newContent) ? 'YouTube 영상 링크' : '웹 URL 링크 자동인식'}</span>
                    </span>
                  ) : newContent.trim().length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm animate-in fade-in">
                      <FileText className="w-3.5 h-3.5" />
                      <span>텍스트 메모 자동인식</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>URL·메모·이미지 자동 분류</span>
                    </span>
                  )}
                </div>

                {/* Smart Unified Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={handleDrop}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isDraggingOver
                      ? 'border-pink-500 ring-2 ring-pink-500/30 bg-pink-500/10'
                      : 'border-slate-800 bg-slate-950/90 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'
                  }`}
                >
                  {imagePreview ? (
                    /* Image Preview Area */
                    <div className="p-3.5 space-y-3">
                      <div className="relative w-full max-h-56 rounded-xl overflow-hidden bg-black/50 border border-slate-800 flex items-center justify-center">
                        <img src={imagePreview} alt="Preview" className="max-h-56 w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setNewContent('');
                          }}
                          className="absolute top-2.5 right-2.5 bg-black/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>이미지 삭제 및 텍스트/URL 입력</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 text-center">
                        이미지가 첨부되었습니다. 다른 이미지를 드래그하거나 새 파일을 선택할 수도 있습니다.
                      </p>
                    </div>
                  ) : (
                    /* Text & URL input area with smart actions */
                    <div className="p-3.5 space-y-2.5">
                      <textarea
                        rows={4}
                        placeholder="웹 링크(URL)를 붙여넣거나, 텍스트 메모를 자유롭게 입력하세요.&#10;이미지 파일은 아래 [이미지 첨부] 버튼을 누르거나 드래그, 또는 Ctrl+V로 붙여넣을 수 있습니다."
                        value={newContent}
                        onChange={(e) => {
                          setNewContent(e.target.value);
                          if (newDescription.trim().length >= 4) {
                            const detected = detectContentType(e.target.value, imagePreview);
                            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                            debounceTimerRef.current = setTimeout(() => {
                              fetchAITags(newDescription, newCategory, detected);
                            }, 600);
                          }
                        }}
                        className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-y min-h-[95px]"
                      />

                      {/* Live YouTube Preview */}
                      {getYoutubeThumbnail(newContent) && (
                        <div className="p-2.5 bg-slate-900/90 rounded-xl border border-red-900/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                          <div className="w-20 h-14 rounded-lg overflow-hidden relative flex-shrink-0 bg-black border border-slate-800">
                            <img
                              src={getYoutubeThumbnail(newContent)!}
                              alt="YouTube Thumbnail Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                              <Play className="w-3.5 h-3.5 fill-white text-white translate-x-0.5" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mb-0.5">
                              <Youtube className="w-3.5 h-3.5" />
                              <span>YouTube 영상 링크 감지됨</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              아카이브에 영상 썸네일과 링크가 연동되어 저장됩니다.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Bottom action toolbar */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-medium transition-colors cursor-pointer text-xs"
                          >
                            <Upload className="w-3.5 h-3.5 text-pink-400" />
                            <span>이미지 첨부</span>
                          </button>
                          <span className="text-[11px] text-slate-500 hidden sm:inline">
                            드래그 & 드롭 또는 Ctrl+V 캡처 가능
                          </span>
                        </div>

                        {newContent.length > 0 && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {newContent.length}자
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Description Sentence & AI Tag Generator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>3. 간단한 설명 문장 입력</span>
                    <span className="text-indigo-400 font-normal">→ AI 자동 태그 생성</span>
                  </label>
                  {isGeneratingTags && (
                    <span className="text-xs text-indigo-400 flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>AI 태그 분석 중...</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="예: 직장에서 탁월한 사람의 특징 3가지"
                    value={newDescription}
                    onChange={handleDescriptionChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {newDescription && (
                    <button
                      type="button"
                      onClick={() => fetchAITags(newDescription, newCategory, newType)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                      title="AI 태그 다시 생성"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>재분석</span>
                    </button>
                  )}
                </div>

                {/* Quick Examples */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-400" /> 예시 입력:
                  </span>
                  {EXAMPLE_SENTENCES.slice(0, 2).map((example, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setNewDescription(example);
                        fetchAITags(example, newCategory, newType);
                      }}
                      className="text-[11px] text-slate-400 hover:text-indigo-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md hover:border-slate-700 transition-colors cursor-pointer truncate max-w-[200px]"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>

                {/* AI Automatic Hashtag Extraction & Display */}
                <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800/90 space-y-2.5 mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-slate-200">AI 자동 생성 해시태그 ({tags.length}개)</span>
                      {aiTagSource === 'ai' && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                          Gemini 3.7
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">태그 클릭 시 삭제</span>
                  </div>

                  {/* Tag Chips List */}
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((t, idx) => (
                        <span
                          key={idx}
                          onClick={() => removeTag(t)}
                          className="inline-flex items-center gap-1 text-xs bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 px-2.5 py-1 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 transition-colors cursor-pointer group"
                          title="클릭하여 태그 제거"
                        >
                          <span>#{t}</span>
                          <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic py-1">
                      {isGeneratingTags
                        ? '설명 문장에서 스마트 해시태그를 추출하고 있습니다...'
                        : '설명 문장을 입력하면 AI가 적절한 해시태그를 자동 생성합니다.'}
                    </p>
                  )}

                  {/* Manual Tag Append */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="+ 태그 직접 추가 (예: 아이디어)"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomTag();
                        }
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={addCustomTag}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {isUploading ? '이미지 업로드 중…' : '아카이브 저장하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add & Manage Categories Modal */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsCategoryModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 cursor-default max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 flex-shrink-0">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-400" />
                카테고리 관리 & 생성
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 flex-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {/* Add New Category */}
              <form onSubmit={handleCreateCategory} className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">새 카테고리 추가</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="카테고리 이름 (예: 독서 & 서평)"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      if (catError) setCatError(null);
                    }}
                    aria-invalid={catError ? true : undefined}
                    className={`flex-1 bg-slate-950 border rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none transition-colors ${
                      catError
                        ? 'border-rose-500/60 focus:border-rose-500'
                        : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer flex-shrink-0"
                  >
                    추가
                  </button>
                </div>

                {catError && (
                  <p
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-rose-300 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {catError}
                  </p>
                )}
              </form>

              {/* Existing Categories List & Deletion */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    등록된 카테고리 목록 ({categories.length})
                  </p>
                  <span className="text-[10px] text-slate-500">휴지통 클릭 시 즉시 삭제</span>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                  {categories.map((cat) => {
                    const count = items.filter((i) => i.category === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <span className="text-xs text-slate-200 font-medium truncate">{cat.name}</span>
                          <span className="text-[10px] text-slate-500">({count}개 항목)</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCategory(cat.id, e)}
                          className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title={`"${cat.name}" 카테고리 삭제`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end mt-4 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedDetailItem && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedDetailItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 cursor-default"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                  {getCategoryName(selectedDetailItem.category)}
                </span>
                <span className="text-xs text-slate-500">{selectedDetailItem.createdAt}</span>
              </div>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description Sentence */}
            <h2 className="text-lg font-bold text-white mb-4 leading-snug">
              {selectedDetailItem.description}
            </h2>

            {/* Content by Type */}
            {selectedDetailItem.type === 'image' && imageSrc(selectedDetailItem.content) && (
              <div className="rounded-xl overflow-hidden border border-slate-800 mb-4 bg-slate-950 relative group">
                <a
                  href={imageSrc(selectedDetailItem.content)}
                  download={`${(selectedDetailItem.description || 'image')
                    .trim()
                    .replace(/[\\/:*?"<>|]/g, '_')
                    .replace(/\s+/g, '_')}.png`}
                  onClick={(e) => {
                    // Also support direct click to trigger custom clean filename download
                    e.preventDefault();
                    downloadImage(imageSrc(selectedDetailItem.content), selectedDetailItem.description);
                  }}
                  className="block cursor-pointer"
                  title="클릭 시 이미지 다운로드 / 우클릭하여 '이미지를 다른 이름으로 저장' 가능"
                >
                  <img
                    src={imageSrc(selectedDetailItem.content)}
                    alt={selectedDetailItem.description}
                    title={selectedDetailItem.description}
                    className="w-full h-auto max-h-96 object-contain mx-auto"
                  />
                </a>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => downloadImage(imageSrc(selectedDetailItem.content), selectedDetailItem.description, e)}
                    className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>저장 ({selectedDetailItem.description.slice(0, 12)}...)</span>
                  </button>
                </div>
              </div>
            )}

            {selectedDetailItem.type === 'text' && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 font-mono text-sm whitespace-pre-wrap leading-relaxed mb-4">
                {selectedDetailItem.content}
              </div>
            )}

            {selectedDetailItem.type === 'link' && (() => {
              const ytThumb = getYoutubeThumbnail(selectedDetailItem.content);
              return (
                <div className="space-y-3 mb-4">
                  {ytThumb && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative group">
                      <a
                        href={selectedDetailItem.content}
                        target="_blank"
                        rel="noreferrer"
                        className="block relative overflow-hidden cursor-pointer"
                        title="YouTube에서 바로 보기"
                      >
                        <img
                          src={ytThumb}
                          alt={selectedDetailItem.description}
                          className="w-full h-auto max-h-80 object-cover mx-auto group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-950/60 group-hover:scale-110 group-hover:bg-red-500 transition-all">
                            <Play className="w-6 h-6 fill-white translate-x-0.5" />
                          </div>
                        </div>
                        {/* YouTube Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                            <Youtube className="w-4 h-4" />
                            YouTube에서 시청하기
                          </span>
                        </div>
                      </a>
                    </div>
                  )}

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">원문 링크</p>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={selectedDetailItem.content}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-indigo-400 hover:underline flex items-center gap-1.5 break-all flex-1 min-w-0"
                      >
                        <Link2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{selectedDetailItem.content}</span>
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                      </a>
                      <button
                        onClick={() => handleCopy(selectedDetailItem.content)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        title={copiedId === 'detail' ? '복사됨!' : '링크 복사'}
                      >
                        {copiedId === 'detail' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Tags */}
            {selectedDetailItem.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-6">
                {selectedDetailItem.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-950 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => deleteItem(selectedDetailItem.id)}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>항목 삭제</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => openEditModal(selectedDetailItem, e)}
                  className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>수정하기</span>
                </button>

                <button
                  onClick={(e) => copyToClipboard(selectedDetailItem.content, selectedDetailItem.id, e)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === selectedDetailItem.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>내용 복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Archive Item Modal */}
      {isEditModalOpen && editingItem && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] cursor-default"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-900/90">
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                아카이브 수정하기
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateItem} className="p-6 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 flex-1">
              {/* 1. Category Dropdown Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    1. 카테고리 선택
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>새 카테고리 추가</span>
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={editCategory || 'none'}
                    onChange={(e) => {
                      setEditCategory(e.target.value);
                      if (editDescription.trim().length >= 4) {
                        const detected = detectContentType(editContent, editImagePreview);
                        fetchEditAITags(editDescription, e.target.value, detected);
                      }
                    }}
                    className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors pr-10"
                  >
                    <option value="none">카테고리 없음</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Unified Content Input (Auto Detection: URL / Text / Image) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>2. 콘텐츠 수정</span>
                    <span className="text-slate-500 font-normal hidden sm:inline">(URL · 메모 · 이미지 자동인식)</span>
                  </label>

                  {/* Real-time Dynamic Detection Badge */}
                  {editImagePreview ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm animate-in fade-in">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>이미지 파일 자동인식</span>
                    </span>
                  ) : detectContentType(editContent, editImagePreview) === 'link' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm animate-in fade-in">
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{getYoutubeThumbnail(editContent) ? 'YouTube 영상 링크' : '웹 URL 링크 자동인식'}</span>
                    </span>
                  ) : editContent.trim().length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm animate-in fade-in">
                      <FileText className="w-3.5 h-3.5" />
                      <span>텍스트 메모 자동인식</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>URL·메모·이미지 자동 분류</span>
                    </span>
                  )}
                </div>

                {/* Smart Unified Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsEditDraggingOver(true);
                  }}
                  onDragLeave={() => setIsEditDraggingOver(false)}
                  onDrop={handleEditDrop}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isEditDraggingOver
                      ? 'border-pink-500 ring-2 ring-pink-500/30 bg-pink-500/10'
                      : 'border-slate-800 bg-slate-950/90 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'
                  }`}
                >
                  {editImagePreview ? (
                    /* Image Preview Area */
                    <div className="p-3.5 space-y-3">
                      <div className="relative w-full max-h-56 rounded-xl overflow-hidden bg-black/50 border border-slate-800 flex items-center justify-center">
                        <img src={editImagePreview} alt="Preview" className="max-h-56 w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setEditImagePreview('');
                            setEditContent('');
                          }}
                          className="absolute top-2.5 right-2.5 bg-black/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>이미지 삭제 및 텍스트/URL 입력</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>새 이미지를 드래그하거나 첨부하여 교체할 수 있습니다.</span>
                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="text-pink-400 hover:text-pink-300 font-medium underline cursor-pointer"
                        >
                          다른 이미지로 변경
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Text & URL input area with smart actions */
                    <div className="p-3.5 space-y-2.5">
                      <textarea
                        rows={4}
                        placeholder="웹 링크(URL)를 붙여넣거나, 텍스트 메모를 자유롭게 입력하세요.&#10;이미지 파일은 아래 [이미지 첨부] 버튼을 누르거나 드래그, 또는 Ctrl+V로 붙여넣을 수 있습니다."
                        value={editContent}
                        onChange={(e) => {
                          setEditContent(e.target.value);
                          if (editDescription.trim().length >= 4) {
                            const detected = detectContentType(e.target.value, editImagePreview);
                            if (editDebounceTimerRef.current) clearTimeout(editDebounceTimerRef.current);
                            editDebounceTimerRef.current = setTimeout(() => {
                              fetchEditAITags(editDescription, editCategory, detected);
                            }, 600);
                          }
                        }}
                        className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-y min-h-[95px]"
                      />

                      {/* Live YouTube Preview */}
                      {getYoutubeThumbnail(editContent) && (
                        <div className="p-2.5 bg-slate-900/90 rounded-xl border border-red-900/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                          <div className="w-20 h-14 rounded-lg overflow-hidden relative flex-shrink-0 bg-black border border-slate-800">
                            <img
                              src={getYoutubeThumbnail(editContent)!}
                              alt="YouTube Thumbnail Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                              <Play className="w-3.5 h-3.5 fill-white text-white translate-x-0.5" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mb-0.5">
                              <Youtube className="w-3.5 h-3.5" />
                              <span>YouTube 영상 링크 감지됨</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              아카이브에 영상 썸네일과 링크가 연동되어 저장됩니다.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Bottom action toolbar */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-medium transition-colors cursor-pointer text-xs"
                          >
                            <Upload className="w-3.5 h-3.5 text-pink-400" />
                            <span>이미지 첨부</span>
                          </button>
                          <span className="text-[11px] text-slate-500 hidden sm:inline">
                            드래그 & 드롭 또는 Ctrl+V 캡처 가능
                          </span>
                        </div>

                        {editContent.length > 0 && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {editContent.length}자
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Description Sentence & AI Tag Generator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>3. 메모 설명 문장</span>
                    <span className="text-indigo-400 font-normal">→ AI 태그 재분석</span>
                  </label>
                  {isEditGeneratingTags && (
                    <span className="text-xs text-indigo-400 flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>AI 태그 분석 중...</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="예: 직장에서 탁월한 사람의 특징 3가지"
                    value={editDescription}
                    onChange={handleEditDescriptionChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {editDescription && (
                    <button
                      type="button"
                      onClick={() => fetchEditAITags(editDescription, editCategory, editType)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                      title="AI 태그 다시 생성"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>재분석</span>
                    </button>
                  )}
                </div>

                {/* AI Automatic Hashtag Extraction & Edit Container */}
                <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800/90 space-y-2.5 mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-slate-200">적용된 해시태그 ({editTags.length}개)</span>
                      {editAiTagSource === 'ai' && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                          Gemini 3.7
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">태그 클릭 시 삭제</span>
                  </div>

                  {/* Tag Chips List */}
                  {editTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {editTags.map((t, idx) => (
                        <span
                          key={idx}
                          onClick={() => removeEditTag(t)}
                          className="inline-flex items-center gap-1 text-xs bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 px-2.5 py-1 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 transition-colors cursor-pointer group"
                          title="클릭하여 태그 제거"
                        >
                          <span>#{t}</span>
                          <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic py-1">
                      {isEditGeneratingTags
                        ? '설명 문장에서 스마트 해시태그를 추출하고 있습니다...'
                        : '태그가 없습니다. 아래에서 직접 추가하거나 설명 문장을 재분석해 보세요.'}
                    </p>
                  )}

                  {/* Manual Tag Append */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="+ 태그 직접 추가 (예: 아이디어)"
                      value={editCustomTagInput}
                      onChange={(e) => setEditCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addEditCustomTag();
                        }
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={addEditCustomTag}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isUploading ? '이미지 업로드 중…' : '수정 사항 저장'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Destructive-action confirmation */}
      {confirmRequest && (
        <ConfirmDialog request={confirmRequest} onCancel={() => setConfirmRequest(null)} />
      )}

      {/* Profile & Dashboard */}
      {isProfileOpen && (
        <ProfileDashboard
          items={items}
          categories={categories}
          onClose={() => setIsProfileOpen(false)}
          onSignOut={() => {
            setIsProfileOpen(false);
            signOut();
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-slate-700 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <Trash2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
