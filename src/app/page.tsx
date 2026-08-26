'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CHAPTERS, Chapter, Lesson } from '@/lib/courseData';
import {
  Play, CheckCircle2, Circle, FileText, Download, Save, Sparkles,
  LogOut, ChevronRight, ChevronDown, BookOpen, Layers, Zap, X, ShieldAlert, ExternalLink,
  Trophy
} from 'lucide-react';
import { LogEarningsModal } from '@/components/LogEarningsModal';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter>(CHAPTERS[0]);
  const [activeLesson, setActiveLesson] = useState<Lesson>(CHAPTERS[0].lessons[0]);

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [noteContent, setNoteContent] = useState<string>('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedNotice, setNoteSavedNotice] = useState(false);

  const [activeTab, setActiveTab] = useState<'notes' | 'resources' | 'overview'>('overview');
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [userTotalEarnings, setUserTotalEarnings] = useState<number>(0);

  // Auth & Progress Initialization
  useEffect(() => {
    const stored = localStorage.getItem('lms_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    try {
      const u = JSON.parse(stored);
      setUser(u);
      fetchUserProgress(u.id);
      fetchUserEarnings(u.id);
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Load notes whenever active lesson changes
  useEffect(() => {
    if (user && activeLesson) {
      fetchLessonNote(user.id, activeLesson.id);
    }
  }, [user, activeLesson]);

  const fetchUserEarnings = async (userId: string) => {
    try {
      const res = await fetch(`/api/earnings?userId=${userId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setUserTotalEarnings(data.totalZar || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserProgress = async (userId: string) => {
    try {
      const res = await fetch(`/api/progress?userId=${userId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setCompletedLessons(data.completedIds || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLessonNote = async (userId: string, lessonId: string) => {
    try {
      const res = await fetch(`/api/notes?userId=${userId}&lessonId=${lessonId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setNoteContent(data.content || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCompleted = async () => {
    if (!user || !activeLesson) return;
    const isCompleted = completedLessons.includes(activeLesson.id);
    const newCompleted = isCompleted
      ? completedLessons.filter(id => id !== activeLesson.id)
      : [...completedLessons, activeLesson.id];

    setCompletedLessons(newCompleted);

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          lessonId: activeLesson.id,
          completed: !isCompleted
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNote = async () => {
    if (!user || !activeLesson) return;
    setSavingNote(true);
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          lessonId: activeLesson.id,
          content: noteContent
        })
      });
      setNoteSavedNotice(true);
      setTimeout(() => setNoteSavedNotice(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDownloadNotes = () => {
    if (!noteContent) return;
    const element = document.createElement("a");
    const file = new Blob([`NOTES FOR: ${activeLesson.title}\n\n${noteContent}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeLesson.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleLogout = () => {
    localStorage.removeItem('lms_user');
    router.push('/login');
  };

  // Calculate total course completion percentage
  const totalLessonsCount = CHAPTERS.reduce((sum, ch) => sum + ch.lessons.length, 0);
  const completionPercentage = Math.round((completedLessons.length / (totalLessonsCount || 1)) * 100);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans">
      {/* 1. TOP HEADER & PROMO BAR */}
      <header className="sticky top-0 z-40 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#00ff66] font-mono text-xs tracking-widest">[◉]</span>
            <span className="font-black text-lg md:text-xl tracking-wider text-white">
              BPO<span className="text-[#d4af37]">.</span>BLUEPRINT
            </span>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20 font-mono text-[10px] uppercase font-bold">
            Course Dashboard
          </span>
        </div>

        {/* Global Progress Bar */}
        <div className="hidden md:flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-1.5 rounded-full">
          <span className="text-xs font-mono text-white/60 uppercase">Progress:</span>
          <div className="w-32 bg-white/10 h-2 rounded-full overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-[#00ff66] to-[#d4af37] h-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold font-mono text-[#00ff66]">{completionPercentage}%</span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setShowEarningsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00ff66]/15 hover:bg-[#00ff66]/25 border border-[#00ff66]/40 text-[#00ff66] font-bold text-xs transition cursor-pointer"
            title="Log your client deals & earnings"
          >
            <Trophy className="w-3.5 h-3.5 text-[#00ff66]" />
            <span>Log Earnings</span>
            {userTotalEarnings > 0 && (
              <span className="bg-[#00ff66] text-black font-black text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                R{userTotalEarnings >= 1000 ? `${Math.round(userTotalEarnings / 1000)}k` : userTotalEarnings}
              </span>
            )}
          </button>

          <a
            href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition cursor-pointer"
            title="50+ Real Client Websites, Apps, Games & Logos"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00ff66]" />
            <span>50+ Work Examples</span>
          </a>

          <button
            onClick={() => setShowUpsellModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-extrabold text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Get 50% OFF App</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <span className="hidden lg:inline-block text-xs font-mono text-white/60">
              {user.fullName || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-red-400 transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. UPSELL PROMO BANNER */}
      <div className="bg-gradient-to-r from-[#d4af37]/20 via-[#00ff66]/10 to-[#d4af37]/20 border-b border-[#d4af37]/30 px-4 py-2.5 text-center flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
          <p className="text-xs text-white font-medium">
            <strong className="text-[#d4af37] uppercase font-bold">Blueprint Member Offer:</strong> Upgrade to the BPOAccelerator Software Suite & Live Coaching for <span className="text-[#00ff66] font-bold underline">50% OFF your first month</span>!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpsellModal(true)}
            className="underline text-xs text-[#d4af37] font-bold hover:text-white transition cursor-pointer"
          >
            Claim 50% OFF Software →
          </button>
          <span className="text-white/20">|</span>
          <a
            href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#00ff66] font-bold hover:underline transition"
          >
            Get 50+ Work Examples (Websites, Apps, Games) →
          </a>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-hidden">
        {/* SIDEBAR: CHAPTER LIST */}
        <aside className="w-full lg:w-80 border-r border-white/10 bg-[#0c0c0c] flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00ff66]" /> Course Chapters
            </span>
            <span className="text-[11px] font-mono text-white/40">
              {completedLessons.length}/{totalLessonsCount} Completed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {CHAPTERS.map((ch) => {
              const isActiveChapter = activeChapter.id === ch.id;
              const chapterCompletedCount = ch.lessons.filter(l => completedLessons.includes(l.id)).length;
              const isChapterDone = chapterCompletedCount === ch.lessons.length;

              return (
                <div key={ch.id} className="bg-transparent">
                  {/* Chapter Accordion Header */}
                  <button
                    onClick={() => setActiveChapter(ch)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                      isActiveChapter ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${
                      isChapterDone ? 'text-[#00ff66]' : 'text-[#d4af37]'
                    }`}>
                      {ch.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white truncate">{ch.title}</h3>
                        {isChapterDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66] shrink-0" />}
                      </div>
                      <p className="text-[11px] text-white/40 truncate mt-0.5">{ch.lessons.length} Lessons · {ch.description}</p>
                    </div>
                  </button>

                  {/* Lessons inside chapter */}
                  {isActiveChapter && (
                    <div className="bg-black/40 py-1 pl-4">
                      {ch.lessons.map((les) => {
                        const isSelectedLesson = activeLesson.id === les.id;
                        const isDone = completedLessons.includes(les.id);

                        return (
                          <button
                            key={les.id}
                            onClick={() => setActiveLesson(les)}
                            className={`w-full text-left py-2.5 px-3 rounded-l-lg flex items-center justify-between text-xs transition cursor-pointer ${
                              isSelectedLesson
                                ? 'bg-[#00ff66]/10 text-[#00ff66] font-bold border-l-2 border-[#00ff66]'
                                : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-white/30 shrink-0" />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>
                            <span className="font-mono text-[10px] text-white/40 shrink-0 ml-2">
                              {les.duration}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SIDEBAR ADD-ONS & UPGRADE PROMPTS */}
          <div className="p-3 border-t border-white/10 bg-black/60 space-y-2.5">
            {/* Student Earnings Tracker widget */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#00ff66]/10 text-[#00ff66] shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-white/50 block truncate">My Earnings</span>
                  <span className="text-sm font-black font-mono text-[#00ff66] truncate block">
                    R{userTotalEarnings.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowEarningsModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-[#00ff66] text-black font-extrabold text-[11px] hover:bg-[#00ff66]/90 transition cursor-pointer shrink-0"
              >
                + Log Deal
              </button>
            </div>

            <a
              href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00ff66]/10 border border-white/10 hover:border-[#00ff66]/40 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white group-hover:text-[#00ff66] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#00ff66]" /> 50+ Work Examples
                </span>
                <span className="text-[9px] font-mono font-bold text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.5 rounded border border-[#d4af37]/20">
                  R2,000
                </span>
              </div>
              <p className="text-[10px] text-white/40 mt-1 leading-tight">
                50+ real client websites, apps, games & logos to win deals.
              </p>
            </a>

            <button
              onClick={() => setShowUpsellModal(true)}
              className="w-full text-left p-2.5 rounded-xl bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#d4af37] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-[#d4af37]" /> Full BPO Suite
                </span>
                <span className="text-[9px] font-mono font-bold text-[#00ff66] bg-[#00ff66]/10 px-1.5 py-0.5 rounded border border-[#00ff66]/20">
                  50% OFF
                </span>
              </div>
              <p className="text-[10px] text-white/50 mt-1 leading-tight">
                Automated lead bots, scripts, live calls & Discord.
              </p>
            </button>
          </div>
        </aside>

        {/* MAIN VIDEO & INTERACTIVE PANEL AREA */}
        <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto space-y-6">
          {/* Current Lesson Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#00ff66]">
                <span>CHAPTER {activeChapter.number}</span>
                <span>/</span>
                <span>{activeChapter.title}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
                {activeLesson.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleCompleted}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  completedLessons.includes(activeLesson.id)
                    ? 'bg-[#00ff66]/20 text-[#00ff66] border-[#00ff66]/40'
                    : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedLessons.includes(activeLesson.id) ? 'Completed' : 'Mark Completed'}</span>
              </button>
            </div>
          </div>

          {/* VIDEO PLAYER CONTAINER */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl group">
            <iframe
              src={activeLesson.videoUrl}
              title={activeLesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* INTERACTIVE TAB SYSTEM (Overview / Notes / Resources) */}
          <div className="glass-panel rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-6 border-b border-white/10 pb-3 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`font-mono text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition cursor-pointer ${
                  activeTab === 'overview' ? 'border-[#00ff66] text-[#00ff66]' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`font-mono text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'notes' ? 'border-[#00ff66] text-[#00ff66]' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>My Lesson Notes</span>
                {noteContent && <span className="w-2 h-2 rounded-full bg-[#00ff66]" />}
              </button>

              <button
                onClick={() => setActiveTab('resources')}
                className={`font-mono text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'resources' ? 'border-[#00ff66] text-[#00ff66]' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Resources ({activeLesson.resources.length})</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-white/80 text-sm leading-relaxed">
                <p>{activeLesson.description}</p>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs space-y-2">
                  <div className="text-white/40 uppercase font-bold">Chapter Key Outcomes:</div>
                  <div className="text-white/70">{activeChapter.description}</div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-white/60 uppercase">
                    Take personal notes for this lesson:
                  </label>
                  <div className="flex items-center gap-2">
                    {noteSavedNotice && (
                      <span className="text-xs text-[#00ff66] font-mono font-bold animate-fade-in">
                        ✓ Notes Saved!
                      </span>
                    )}
                    <button
                      onClick={handleDownloadNotes}
                      disabled={!noteContent}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white/80 transition cursor-pointer disabled:opacity-40"
                    >
                      Export Notes (.txt)
                    </button>
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#00ff66] text-black font-bold text-xs hover:bg-[#00ff66]/90 transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingNote ? 'Saving...' : 'Save Notes'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your action items, scripts, and notes for this lesson here..."
                  className="w-full bg-black/50 border border-white/10 focus:border-[#00ff66] rounded-xl p-4 text-sm text-white placeholder-white/30 outline-none font-mono leading-relaxed"
                />
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-3">
                <p className="text-xs text-white/60 font-mono mb-2">
                  Download templates, SOPs, and scripts for this lesson:
                </p>
                {activeLesson.resources.map((res, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00ff66]/40 transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#00ff66]/10 text-[#00ff66]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">{res.title}</span>
                        <span className="text-[10px] font-mono text-white/40 uppercase">{res.type} Format</span>
                      </div>
                    </div>
                    <a
                      href={res.url}
                      download
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#00ff66] hover:text-black text-white text-xs font-bold transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 4. UPSELL MODAL DIALOG */}
      {showUpsellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0f0f0f] border-2 border-[#d4af37] rounded-3xl p-6 md:p-8 shadow-[0_0_80px_rgba(212,175,55,0.3)] space-y-6">
            <button
              onClick={() => setShowUpsellModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] font-mono text-[10px] uppercase font-bold">
                <Sparkles className="w-3 h-3" /> Exclusive Blueprint Member Perk
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                GET THE SOFTWARE FOR <span className="text-[#00ff66]">50% OFF</span>
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-mono">
                Get 50% OFF your first month of the complete BPOAccelerator Software Suite, automated lead bidding tools, weekly live coaching calls & private VIP community.
              </p>
            </div>

            <div className="space-y-3 bg-white/[0.02] border border-white/10 p-4 rounded-2xl text-xs space-y-2 font-mono">
              <div className="flex items-center gap-2 text-[#00ff66]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Full AI Upwork & Freelancer Bidding Suite</span>
              </div>
              <div className="flex items-center gap-2 text-[#00ff66]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Weekly Live Q&A Coaching Calls with Chris</span>
              </div>
              <div className="flex items-center gap-2 text-[#00ff66]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Private Discord Community with 500+ Agency Founders</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="https://bpoaccelerator.ai?signup=true&coupon=50OFF"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-black py-4 rounded-xl hover:brightness-110 transition text-sm shadow-xl cursor-pointer"
              >
                Claim 50% OFF First Month <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-[#00ff66] hover:text-black text-white font-bold py-3.5 rounded-xl border border-white/15 transition text-xs cursor-pointer"
              >
                <BookOpen className="w-4 h-4" /> Get 50+ Work Examples (Websites, Apps, Games, Logos)
              </a>

              <button
                onClick={() => setShowUpsellModal(false)}
                className="w-full text-center text-xs text-white/40 hover:text-white transition pt-1 cursor-pointer"
              >
                No thanks, continue with Blueprint course only
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 5. LOG EARNINGS MODAL DIALOG */}
      <LogEarningsModal
        isOpen={showEarningsModal}
        onClose={() => setShowEarningsModal(false)}
        userId={user.id}
        onEarningsUpdated={(total) => setUserTotalEarnings(total)}
      />
    </div>
  );
}
