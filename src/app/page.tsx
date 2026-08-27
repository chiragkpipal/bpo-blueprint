'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play, CheckCircle2, Circle, FileText, Download, Save, Sparkles,
  LogOut, ChevronRight, ChevronDown, BookOpen, Layers, Zap, X,
  Trophy, ArrowRight, ArrowLeft, Clock, CheckSquare, Square,
  Check, Terminal, Loader2
} from 'lucide-react';
import { LogEarningsModal } from '@/components/LogEarningsModal';
import VidalyticsPlayer from '@/components/VidalyticsPlayer';

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  orderIndex: number;
  attachments?: any[];
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: Lesson[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Dynamic Course State from Database
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [noteContent, setNoteContent] = useState<string>('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedNotice, setNoteSavedNotice] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'notes' | 'software'>('overview');
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [userTotalEarnings, setUserTotalEarnings] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Local Action checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // 1. Auth & Progress Initialization
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

  // 2. Fetch Dynamic Course Data from Database
  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoadingCourse(true);
        const res = await fetch('/api/course');
        const json = await res.json();
        if (json.status === 'success' && json.data && json.data.length > 0) {
          setChapters(json.data);
          const firstChapter = json.data[0];
          setActiveChapter(firstChapter);
          if (firstChapter.lessons && firstChapter.lessons.length > 0) {
            setActiveLesson(firstChapter.lessons[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load course from database:', err);
      } finally {
        setLoadingCourse(false);
      }
    }

    fetchCourseData();
  }, []);

  // 3. Load notes & checklist whenever active lesson changes
  useEffect(() => {
    if (user && activeLesson) {
      fetchLessonNote(user.id, activeLesson.id);
      try {
        const savedChecklist = localStorage.getItem(`checklist_${activeLesson.id}`);
        if (savedChecklist) {
          setChecklist(JSON.parse(savedChecklist));
        } else {
          setChecklist({});
        }
      } catch (e) {
        console.error(e);
      }
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
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          lessonId: activeLesson.id,
          content: noteContent
        })
      });
      if (res.ok) {
        setNoteSavedNotice(true);
        setTimeout(() => setNoteSavedNotice(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNote(false);
    }
  };

  const handleToggleChecklistItem = (itemIndex: number) => {
    if (!activeLesson) return;
    const key = `${activeLesson.id}_${itemIndex}`;
    const nextState = !checklist[key];
    const updated = { ...checklist, [key]: nextState };
    setChecklist(updated);
    try {
      localStorage.setItem(`checklist_${activeLesson.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lms_user');
    router.push('/login');
  };

  // Calculations for progress bar
  const totalLessonsCount = useMemo(() => {
    return chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);
  }, [chapters]);

  const completionPercentage = useMemo(() => {
    if (totalLessonsCount === 0) return 0;
    return Math.min(100, Math.round((completedLessons.length / totalLessonsCount) * 100));
  }, [completedLessons, totalLessonsCount]);

  // Lesson navigation
  const allLessonsFlat = useMemo(() => {
    const list: { chapter: Chapter; lesson: Lesson }[] = [];
    chapters.forEach(ch => {
      (ch.lessons || []).forEach(les => {
        list.push({ chapter: ch, lesson: les });
      });
    });
    return list;
  }, [chapters]);

  const currentLessonIndex = useMemo(() => {
    if (!activeLesson) return 0;
    return allLessonsFlat.findIndex(item => item.lesson.id === activeLesson.id);
  }, [allLessonsFlat, activeLesson]);

  const prevLesson = currentLessonIndex > 0 ? allLessonsFlat[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessonsFlat.length - 1 ? allLessonsFlat[currentLessonIndex + 1] : null;

  const navigateToLesson = (item: { chapter: Chapter; lesson: Lesson }) => {
    setActiveChapter(item.chapter);
    setActiveLesson(item.lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteAndNext = async () => {
    if (!activeLesson) return;
    if (!completedLessons.includes(activeLesson.id)) {
      await handleToggleCompleted();
    }
    if (nextLesson) {
      navigateToLesson(nextLesson);
    }
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono space-y-4">
        <Loader2 className="w-8 h-8 text-matrix animate-spin" />
        <span className="text-xs uppercase tracking-widest text-matrix">Loading The BPO Blueprint...</span>
      </div>
    );
  }

  if (!activeChapter || !activeLesson) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono space-y-4">
        <span className="text-xs uppercase tracking-widest text-white/50">No course material found in database.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col theme-blueprint selection:bg-matrix selection:text-black">
      {/* 1. TOP MATRIX NAVBAR */}
      <header className="h-16 border-b border-matrix/30 bg-black/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
        {/* Brand & Chapter Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-matrix transition"
            aria-label="Toggle Menu"
          >
            <Layers className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-matrix font-mono font-bold tracking-wider">[◉]</span>
            <span className="font-display font-black tracking-tight text-white text-base md:text-lg">
              BPO<span className="text-gold">.BLUEPRINT</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10 font-mono text-xs text-white/50">
            <span className="w-2 h-2 rounded-full bg-matrix animate-pulse"></span>
            <span>STUDENT PORTAL</span>
          </div>
        </div>

        {/* Global Progress & Quick Stats */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Progress Pill */}
          <div className="hidden sm:flex items-center gap-3 bg-white/[0.02] border border-matrix/30 rounded-full px-4 py-1.5 font-mono text-xs">
            <span className="text-matrix font-bold">{completionPercentage}%</span>
            <div className="w-20 md:w-28 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-matrix to-gold transition-all duration-500 shadow-[0_0_10px_rgba(0,230,90,0.5)]"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-white/40 hidden md:inline">COMPLETE</span>
          </div>

          {/* Student Earnings Badge */}
          <button
            onClick={() => setShowEarningsModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-matrix/10 hover:bg-matrix/20 border border-matrix/40 text-matrix font-mono text-xs transition cursor-pointer"
            title="Log Your Client Revenue"
          >
            <Trophy className="w-3.5 h-3.5 text-matrix" />
            <span className="hidden sm:inline">EARNINGS:</span>
            <span className="text-white font-bold">
              R{userTotalEarnings >= 1000 ? `${Math.round(userTotalEarnings / 1000)}k` : userTotalEarnings.toLocaleString()}
            </span>
          </button>

          {/* 50+ Work Examples */}
          <a
            href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/10 border border-white/20 text-white font-mono text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-matrix" />
            <span>50+ Work Examples</span>
          </a>

          {/* Upgrade Button */}
          <button
            onClick={() => setShowUpsellModal(true)}
            className="btn-gold !py-2 !px-4 !text-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">50% OFF App</span>
            <span className="sm:hidden">Upgrade</span>
          </button>

          {/* Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <button
              onClick={handleLogout}
              className="p-1.5 text-white/40 hover:text-matrix transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. TICKER BANNER */}
      <div className="bg-black border-b border-matrix/30 px-4 py-2 text-center flex flex-wrap items-center justify-center gap-3 font-mono text-xs uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
          <span className="text-white/80">
            <strong className="text-gold">// STUDENT OFFER:</strong> Unlock BPO Accelerator Software & Live Calls for{' '}
            <span className="text-matrix font-bold underline cursor-pointer" onClick={() => setShowUpsellModal(true)}>
              50% OFF
            </span>!
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpsellModal(true)}
            className="text-gold font-bold hover:underline transition cursor-pointer"
          >
            Claim 50% Coupon →
          </button>
          <span className="text-white/20">|</span>
          <a
            href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
            target="_blank"
            rel="noopener noreferrer"
            className="text-matrix font-bold hover:underline transition"
          >
            50+ Portfolio (R2,000) →
          </a>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD SPLIT VIEW */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-hidden relative">
        {/* SIDEBAR: CHAPTERS & LESSONS */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-80 sm:w-88 lg:w-80 xl:w-92 bg-black border-r border-matrix/30 flex flex-col shrink-0 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0 top-[96px] bottom-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-matrix/30 bg-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-matrix font-mono text-xs">[◉]</span>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                Course Modules
              </span>
            </div>
            <span className="font-mono text-[11px] text-matrix">
              {completedLessons.length} / {totalLessonsCount} Completed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar bg-black">
            {chapters.map((ch, idx) => {
              const isActiveChapter = activeChapter?.id === ch.id;
              const chapterCompletedCount = (ch.lessons || []).filter(l => completedLessons.includes(l.id)).length;
              const isChapterDone = chapterCompletedCount === (ch.lessons?.length || 0) && (ch.lessons?.length || 0) > 0;

              return (
                <div key={ch.id} className="bg-transparent">
                  {/* Chapter Header */}
                  <button
                    onClick={() => setActiveChapter(ch)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition cursor-pointer ${
                      isActiveChapter ? 'bg-white/[0.04] border-l-2 border-matrix' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${
                      isChapterDone ? 'text-matrix' : isActiveChapter ? 'text-matrix' : 'text-gold'
                    }`}>
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-display text-sm font-bold truncate ${isActiveChapter ? 'text-white' : 'text-white/80'}`}>
                          {ch.title}
                        </h3>
                        {isChapterDone ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-matrix shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-white/40 shrink-0">
                            {chapterCompletedCount}/{ch.lessons?.length || 0}
                          </span>
                        )}
                      </div>
                      {ch.description && (
                        <p className="font-mono text-[11px] text-white/40 truncate mt-0.5">
                          {ch.description}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Lessons */}
                  {isActiveChapter && (
                    <div className="bg-black/80 py-1.5 px-3 space-y-1 border-t border-b border-white/5">
                      {(ch.lessons || []).map((les) => {
                        const isSelectedLesson = activeLesson?.id === les.id;
                        const isDone = completedLessons.includes(les.id);

                        return (
                          <button
                            key={les.id}
                            onClick={() => {
                              setActiveLesson(les);
                              setSidebarOpen(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-full text-left py-2.5 px-3 rounded flex items-center justify-between text-xs transition cursor-pointer ${
                              isSelectedLesson
                                ? 'bg-matrix/10 text-matrix font-mono font-bold border border-matrix/50 shadow-[0_0_20px_rgba(0,230,90,0.15)]'
                                : 'text-white/70 hover:text-white hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-matrix shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-white/30 shrink-0" />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>
                            <span className="font-mono text-[10px] text-white/40 shrink-0">
                              {les.duration || '12 min'}
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

          {/* Sidebar Footer Widget */}
          <div className="p-3.5 border-t border-matrix/30 bg-black space-y-2">
            <div className="p-3 rounded border border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded bg-matrix/10 text-matrix shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-[10px] uppercase text-white/40 block truncate">Total Verified</span>
                  <span className="font-mono text-xs font-bold text-matrix truncate block">
                    R{userTotalEarnings.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowEarningsModal(true)}
                className="btn-gold !py-1.5 !px-3 !text-[10px]"
              >
                + Log Deal
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* MAIN VIDEO & STUDY HUB */}
        <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-10 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
          {/* Header breadcrumb & title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-matrix uppercase tracking-[0.2em]">
                <span>MODULE {activeChapter.orderIndex + 1}</span>
                <span className="text-white/40">/</span>
                <span className="text-gold">{activeChapter.title}</span>
              </div>
              <h1 className="font-display font-black text-2xl md:text-4xl text-white tracking-tight mt-1">
                {activeLesson.title}
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleToggleCompleted}
                className={`btn-ghost-matrix !py-2 !px-4 !text-xs ${
                  completedLessons.includes(activeLesson.id)
                    ? '!bg-matrix/15 !border-matrix !text-matrix shadow-[0_0_30px_rgba(0,230,90,0.3)]'
                    : ''
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedLessons.includes(activeLesson.id) ? 'Completed ✓' : 'Mark Completed'}</span>
              </button>
            </div>
          </div>

          {/* VIDEO CINEMA CONTAINER WITH REAL VIDALYTICS STREAM */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-matrix/50 bg-black shadow-[0_0_50px_rgba(0,230,90,0.15)] group">
            <VidalyticsPlayer videoUrl={activeLesson.videoUrl} />
          </div>

          {/* LESSON NAVIGATION BAR */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div>
              {prevLesson ? (
                <button
                  onClick={() => navigateToLesson(prevLesson)}
                  className="btn-ghost-matrix !py-2 !px-4 !text-xs font-mono"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Previous: {prevLesson.lesson.title}</span>
                  <span className="sm:hidden">Previous</span>
                </button>
              ) : (
                <span className="font-mono text-xs text-white/30 px-3 py-2">First Lesson</span>
              )}
            </div>

            <div>
              <button
                onClick={handleCompleteAndNext}
                className="btn-gold !py-2.5 !px-5 !text-xs font-mono"
              >
                <span>{completedLessons.includes(activeLesson.id) ? 'Next Lesson' : 'Complete & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* INTERACTIVE STUDY HUB TABS */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-8 space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-3 sm:gap-6 border-b border-white/10 pb-3 overflow-x-auto custom-scrollbar font-mono text-xs uppercase tracking-widest">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 border-b-2 transition cursor-pointer shrink-0 ${
                  activeTab === 'overview'
                    ? 'border-matrix text-matrix font-bold'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                1. Lesson Brief & Details
              </button>

              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'resources'
                    ? 'border-matrix text-matrix font-bold'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                2. Toolkit & Downloads
                <span className="px-1.5 py-0.5 text-[9px] rounded bg-white/10 text-gold">
                  {activeLesson.attachments?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'notes'
                    ? 'border-matrix text-matrix font-bold'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                3. Private Notes
                {noteContent.trim().length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-matrix"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('software')}
                className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'software'
                    ? 'border-matrix text-matrix font-bold'
                    : 'border-transparent text-gold hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-gold" />
                4. Software Scaling (50% Off)
              </button>
            </div>

            {/* TAB CONTENT: 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-mono text-xs font-bold text-matrix uppercase tracking-widest mb-3">
                    // LESSON INSTRUCTIONS & DETAILS
                  </h3>
                  {activeLesson.description ? (
                    <div className="font-sans text-sm text-white/90 leading-relaxed space-y-4 whitespace-pre-line bg-black/40 p-6 rounded-xl border border-white/10">
                      {activeLesson.description}
                    </div>
                  ) : (
                    <div className="font-mono text-xs text-white/40 bg-black/40 p-6 rounded-xl border border-white/5 text-center">
                      No additional notes provided for this lesson. Watch the video stream above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. RESOURCES */}
            {activeTab === 'resources' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs font-bold text-matrix uppercase tracking-widest">
                    // ATTACHED ASSETS & TEMPLATES
                  </h3>
                </div>

                {activeLesson.attachments && activeLesson.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeLesson.attachments.map((att: any, idx: number) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-matrix/50 hover:bg-matrix/5 transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded bg-matrix/10 text-matrix group-hover:scale-110 transition">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-mono text-xs font-bold text-white truncate">{att.title || 'Downloadable Asset'}</h4>
                            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{att.type || 'DOCUMENT'}</span>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-white/40 group-hover:text-matrix transition shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-white/5 bg-black/40 text-center text-white/40 font-mono text-xs">
                    All templates and links for this lesson are contained inside the Lesson Brief tab above.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-mono text-xs font-bold text-matrix uppercase tracking-widest">
                      // PRIVATE STUDENT NOTEBOOK
                    </h3>
                    <p className="font-mono text-[11px] text-white/40">Auto-saved to your personal cloud database profile.</p>
                  </div>
                  {noteSavedNotice && (
                    <span className="font-mono text-xs text-matrix flex items-center gap-1.5 animate-bounce">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                </div>

                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type your notes, lead details, client outreach ideas, or prompt adaptations for this lesson..."
                  className="w-full h-44 bg-black/60 border border-white/10 focus:border-matrix rounded-xl p-4 font-mono text-xs text-white placeholder-white/20 outline-none resize-none transition"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="btn-gold !py-2.5 !px-6 !text-xs font-mono flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingNote ? 'Saving Notes...' : 'Save Lesson Note'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. SOFTWARE UPGRADE */}
            {activeTab === 'software' && (
              <div className="p-6 md:p-8 rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 via-black to-black space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gold/20 text-gold border border-gold/30">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-gold font-bold">VIP STUDENT UPGRADE</span>
                    <h3 className="font-display font-black text-xl md:text-2xl text-white">
                      BPO Accelerator Auto-Bidding & Outreach Suite
                    </h3>
                  </div>
                </div>

                <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed">
                  You have lifetime access to <strong>The BPO Blueprint</strong> training. When you are ready to automate your lead discovery, auto-sync proposals, and connect directly with high-ticket clients, activate the full BPO Accelerator software.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                    <span className="text-matrix font-bold block mb-1">⚡ Auto-Bidding</span>
                    <span className="text-white/60 text-[11px]">Sync proposals across Freelancer & Upwork in seconds.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                    <span className="text-matrix font-bold block mb-1">🎯 Direct Lead Scraper</span>
                    <span className="text-white/60 text-[11px]">Direct company owner phone numbers & emails.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                    <span className="text-matrix font-bold block mb-1">📞 Weekly Live Calls</span>
                    <span className="text-white/60 text-[11px]">Private strategy workshops & contract reviews with Chris.</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <button
                    onClick={() => setShowUpsellModal(true)}
                    className="w-full sm:w-auto btn-gold !py-3 !px-8 !text-xs font-mono"
                  >
                    Claim 50% Student Discount →
                  </button>
                  <a
                    href="https://bpoaccelerator.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-white/60 hover:text-white underline"
                  >
                    Learn more about the software suite
                  </a>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 4. MODALS */}
      {/* Earnings Modal */}
      {showEarningsModal && (
        <LogEarningsModal
          isOpen={showEarningsModal}
          userId={user?.id}
          onClose={() => setShowEarningsModal(false)}
          onEarningsUpdated={(newTotal) => setUserTotalEarnings(newTotal)}
        />
      )}

      {/* Software 50% Upsell Modal */}
      {showUpsellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-black border border-gold/50 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-[0_0_80px_rgba(212,175,55,0.2)] relative">
            <button
              onClick={() => setShowUpsellModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-widest text-gold font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Special 50% Blueprint Student Voucher
              </span>
              <h3 className="font-display font-black text-2xl text-white">
                Unlock BPO Accelerator Suite
              </h3>
              <p className="font-sans text-xs text-white/70 leading-relaxed">
                Take your agency to R100,000/month by unlocking AI lead scrapers, automated proposal dispatchers, and live weekly coaching calls.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 block">Your Exclusive Coupon</span>
                <span className="font-mono text-base font-bold text-gold">BLUEPRINT50</span>
              </div>
              <span className="font-mono text-xs font-black text-matrix bg-matrix/10 px-3 py-1 rounded border border-matrix/30">
                50% OFF FOREVER
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="https://app.bpoaccelerator.ai/signup?coupon=BLUEPRINT50"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-gold !py-3.5 !text-xs font-mono flex items-center justify-center gap-2"
              >
                <span>Activate BPO Accelerator Software</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => setShowUpsellModal(false)}
                className="w-full text-center font-mono text-xs text-white/40 hover:text-white py-1"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
