import React, { useEffect, useState } from 'react';
import { Loader2, LogIn, UserPlus, AlertCircle, MailCheck } from 'lucide-react';
import { NoteBoxLogo } from './App';
import { getSession, onAuthStateChange, signIn, signUp } from './lib/api';

type Mode = 'signin' | 'signup';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getSession()
      .then((session) => setUserId(session?.user.id ?? null))
      .finally(() => setChecking(false));
    return onAuthStateChange(setUserId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || password.length < 6) {
      setError('이메일을 입력하고 비밀번호는 6자 이상으로 설정해 주세요.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const data = await signUp(email.trim(), password);
        if (!data.session) {
          setNotice('가입 확인 메일을 보냈습니다. 메일의 링크를 눌러 인증을 완료해 주세요.');
        }
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      setError(err?.message ?? '로그인에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (userId) return <>{children}</>;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <NoteBoxLogo className="w-16 h-16 drop-shadow-[0_0_18px_rgba(168,85,247,0.5)]" />
          <h1 className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-purple-300 via-pink-200 to-indigo-200 bg-clip-text text-transparent">
            NoteBox
          </h1>
          <p className="text-sm text-slate-400">흩어진 기록을 한 곳에 담아두세요</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-purple-950/20"
        >
          <div className="flex gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNotice(null);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  mode === m
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'signin' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />

          <input
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (6자 이상)"
            className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />

          {error && (
            <div className="flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="flex items-start gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
              <MailCheck className="w-4 h-4 flex-shrink-0 mt-px" />
              <span>{notice}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white border border-indigo-400/40 rounded-xl font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'signin' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{mode === 'signin' ? '로그인' : '가입하기'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
