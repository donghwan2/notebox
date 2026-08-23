import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  FileText,
  Link2,
  Image as ImageIcon,
  Star,
  Folder,
  Tag,
  CalendarDays,
  Clock,
  LogOut,
  Flame,
} from 'lucide-react';
import type { ArchiveItem, Category } from './App';
import * as api from './lib/api';

type Props = {
  items: ArchiveItem[];
  categories: Category[];
  onClose: () => void;
  onSignOut: () => void;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${formatDate(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}

/** Local YYYY-MM-DD key, so day buckets line up with the user's calendar. */
function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

const TYPE_META = {
  text: { label: '텍스트 메모', Icon: FileText, tone: 'text-blue-300', bar: 'bg-blue-500' },
  link: { label: '웹 링크', Icon: Link2, tone: 'text-purple-300', bar: 'bg-purple-500' },
  image: { label: '이미지', Icon: ImageIcon, tone: 'text-pink-300', bar: 'bg-pink-500' },
} as const;

export default function ProfileDashboard({ items, categories, onClose, onSignOut }: Props) {
  const [user, setUser] = useState<api.UserProfile | null>(null);

  useEffect(() => {
    api.getCurrentUser().then(setUser);
  }, []);

  const stats = useMemo(() => {
    const byType = { text: 0, link: 0, image: 0 };
    const tagCounts = new Map<string, number>();
    const catCounts = new Map<string, number>();
    const days = new Set<string>();

    let favorites = 0;
    let uncategorized = 0;
    let oldest: number | null = null;

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    let last7 = 0;
    let last30 = 0;

    for (const item of items) {
      byType[item.type] = (byType[item.type] ?? 0) + 1;
      if (item.isFavorite) favorites += 1;

      const known = categories.some((c) => c.id === item.category);
      if (known) {
        catCounts.set(item.category, (catCounts.get(item.category) ?? 0) + 1);
      } else {
        uncategorized += 1;
      }

      for (const tag of item.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }

      const ts = item.timestamp ?? 0;
      if (ts) {
        days.add(dayKey(ts));
        if (oldest === null || ts < oldest) oldest = ts;
        if (ts >= weekAgo) last7 += 1;
        if (ts >= monthAgo) last30 += 1;
      }
    }

    const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

    const catRanking = categories
      .map((c) => ({ ...c, count: catCounts.get(c.id) ?? 0 }))
      .concat(
        uncategorized > 0
          ? [{ id: '__none__', name: '카테고리 없음', icon: '📭', count: uncategorized }]
          : []
      )
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    return {
      total: items.length,
      byType,
      favorites,
      uniqueTags: tagCounts.size,
      topTags,
      catRanking,
      activeDays: days.size,
      last7,
      last30,
      oldest,
    };
  }, [items, categories]);

  const recent = useMemo(
    () => [...items].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)).slice(0, 5),
    [items]
  );

  const initial = (user?.email?.[0] ?? '?').toUpperCase();
  const maxCat = stats.catRanking[0]?.count ?? 1;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl cursor-default max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-800 flex-shrink-0 bg-gradient-to-br from-indigo-950/40 to-purple-950/20">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-purple-900/40 flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{user?.email ?? '불러오는 중…'}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  가입 {formatDate(user?.createdAt ?? null)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  최근 접속 {formatDateTime(user?.lastSignInAt ?? null)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer flex-shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Headline numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: '전체 아카이브', value: stats.total, tone: 'text-indigo-300' },
              { label: '즐겨찾기', value: stats.favorites, tone: 'text-amber-300' },
              { label: '태그 종류', value: stats.uniqueTags, tone: 'text-purple-300' },
              { label: '기록한 날', value: stats.activeDays, tone: 'text-emerald-300' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-3"
              >
                <p className={`text-2xl font-bold tabular-nums ${s.tone}`}>{s.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-4">
            <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <p className="text-xs text-slate-400">
              최근 7일 <span className="text-slate-100 font-semibold">{stats.last7}개</span>
              <span className="mx-2 text-slate-700">·</span>
              최근 30일 <span className="text-slate-100 font-semibold">{stats.last30}개</span>
              {stats.oldest && (
                <>
                  <span className="mx-2 text-slate-700">·</span>첫 기록 {formatDate(new Date(stats.oldest).toISOString())}
                </>
              )}
            </p>
          </div>

          {/* Type breakdown */}
          <section className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              타입별 분포
            </h4>
            <div className="space-y-2">
              {(['text', 'link', 'image'] as const).map((type) => {
                const meta = TYPE_META[type];
                const count = stats.byType[type];
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <meta.Icon className={`w-4 h-4 flex-shrink-0 ${meta.tone}`} />
                    <span className="text-xs text-slate-300 w-20 flex-shrink-0">{meta.label}</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${meta.bar} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums w-14 text-right flex-shrink-0">
                      {count}개 · {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Categories */}
          {stats.catRanking.length > 0 && (
            <section className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-3 h-3" />
                카테고리별 ({categories.length}개 운영 중)
              </h4>
              <div className="space-y-1.5">
                {stats.catRanking.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-sm flex-shrink-0">{c.icon}</span>
                    <span className="text-xs text-slate-300 flex-1 truncate">{c.name}</span>
                    <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(c.count / maxCat) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums w-8 text-right flex-shrink-0">
                      {c.count}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top tags */}
          {stats.topTags.length > 0 && (
            <section className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                자주 쓴 태그
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {stats.topTags.map(([tag, count]) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center gap-1.5"
                  >
                    #{tag}
                    <span className="text-[10px] opacity-70">({count})</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Recent items */}
          {recent.length > 0 && (
            <section className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                최근 저장한 항목
              </h4>
              <div className="space-y-1.5">
                {recent.map((item) => {
                  const meta = TYPE_META[item.type];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2"
                    >
                      <meta.Icon className={`w-3.5 h-3.5 flex-shrink-0 ${meta.tone}`} />
                      <p className="text-xs text-slate-300 flex-1 truncate">{item.description}</p>
                      {item.isFavorite && (
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                      )}
                      <span className="text-[10px] text-slate-500 flex-shrink-0">
                        {item.createdAt.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {stats.total === 0 && (
            <p className="text-center text-xs text-slate-500 py-6">
              아직 저장한 항목이 없습니다. 첫 기록을 남겨보세요.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0 bg-slate-950/40">
          <button
            onClick={onSignOut}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
