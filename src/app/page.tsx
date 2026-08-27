'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CHAPTERS, Chapter, Lesson } from '@/lib/courseData';
import {
  Play, CheckCircle2, Circle, FileText, Download, Save, Sparkles,
  LogOut, ChevronRight, ChevronDown, BookOpen, Layers, Zap, X,
  Trophy, ArrowRight, ArrowLeft, Clock, CheckSquare, Square,
  Check, Terminal
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

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'notes' | 'software'>('overview');
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [userTotalEarnings, setUserTotalEarnings] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Local Action checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

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
    const file = new Blob([`BPO BLUEPRINT NOTES — ${activeLesson.title}\n\n${noteContent}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeLesson.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleChecklistItem = (itemIndex: number) => {
    const newChecklist = {
      ...checklist,
      [itemIndex]: !checklist[itemIndex]
    };
    setChecklist(newChecklist);
    if (activeLesson) {
      localStorage.setItem(`checklist_${activeLesson.id}`, JSON.stringify(newChecklist));
    }
  };

  // Flattened lessons for navigation
  const allLessons = useMemo(() => {
    return CHAPTERS.flatMap(ch => ch.lessons.map(les => ({ ...les, chapter: ch })));
  }, []);

  const currentLessonIndex = allLessons.findIndex(l => l.id === activeLesson.id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const navigateToLesson = (lessonItem: typeof allLessons[0]) => {
    setActiveChapter(lessonItem.chapter);
    setActiveLesson(lessonItem);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteAndNext = async () => {
    if (!completedLessons.includes(activeLesson.id)) {
      await handleToggleCompleted();
    }
    if (nextLesson) {
      navigateToLesson(nextLesson);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lms_user');
    router.push('/login');
  };

  const totalLessonsCount = allLessons.length;
  const completionPercentage = Math.round((completedLessons.length / (totalLessonsCount || 1)) * 100);

  const actionItems = useMemo(() => {
    switch (activeChapter.id) {
      case 'ch-01':
        return [
          "Understand the core profit dynamics of the BPO middleman business model.",
          "Identify 3 primary international target markets (US, UK, Australia).",
          "Select 2 high-margin niches where remote talent delivers massive ROI."
        ];
      case 'ch-02':
        return [
          "Choose your core service offering (Appointment Setting, Lead Gen, or Web Dev).",
          "Calculate your cost-plus markup to ensure 60%+ net profit margin.",
          "Finalize your monthly retainer pricing structure."
        ];
      case 'ch-03':
        return [
          "Set up secondary domain infrastructure & DNS records (SPF, DKIM, DMARC).",
          "Build a targeted lead list of 250+ decision-makers in your chosen niche.",
          "Deploy cold email & LinkedIn outreach sequences."
        ];
      case 'ch-04':
        return [
          "Prepare discovery call framework and objection-handling scripts.",
          "Conduct discovery call focusing on client pain points and operational bottlenecks.",
          "Send service agreement and secure upfront payment / retainer."
        ];
      case 'ch-05':
        return [
          "Vet and hire skilled delivery specialists via Upwork / Freelancer.",
          "Set up client communication Slack / Discord workspace.",
          "Deliver quality work while managing the team and protecting your margin."
        ];
      case 'ch-06':
        return [
          "Standardize operational SOPs so team runs autonomously.",
          "Reinvest profits into multi-inbox cold email automation.",
          "Scale retainers to R100,000+ / $5,000+ monthly recurring revenue."
        ];
      default:
        return [
          "Watch the full module video without skipping.",
          "Take notes on key frameworks and methodologies.",
          "Implement the action steps before moving to the next chapter."
        ];
    }
  }, [activeChapter.id]);

  if (!user) return null;

  return (
    <div className="theme-blueprint min-h-screen bg-black text-white flex flex-col font-sans selection:bg-matrix selection:text-black">
      {/* 1. TOP NAVIGATION HEADER (Matching blueprint-landing) */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-matrix/40 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden text-matrix cursor-pointer p-1"
            aria-label="Toggle Curriculum"
          >
            <Terminal className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-matrix font-mono text-xs tracking-widest">[◉]</span>
            <span className="font-display text-sm md:text-base font-black tracking-[0.18em] text-white">
              BPO<span className="text-gold">.</span>BLUEPRINT
            </span>
          </div>

          <span className="hidden sm:inline-block px-2 py-0.5 rounded border border-matrix/40 font-mono text-[10px] font-bold text-matrix uppercase tracking-widest ml-2">
            STUDENT PORTAL
          </span>
        </div>

        {/* Global Progress Bar */}
        <div className="hidden md:flex items-center gap-3 bg-white/[0.02] border border-matrix/30 px-4 py-1.5 rounded-full">
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">Progress:</span>
          <div className="w-28 lg:w-36 bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-matrix h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-matrix">{completionPercentage}%</span>
          <span className="font-mono text-[10px] text-white/40">({completedLessons.length}/{totalLessonsCount})</span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Earnings Deal Tracker Button */}
          <button
            onClick={() => setShowEarningsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-matrix/10 border border-matrix/40 text-matrix font-mono text-xs font-bold transition cursor-pointer"
            title="Log verified client deals & track earnings"
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
                Course Chapters
              </span>
            </div>
            <span className="font-mono text-[11px] text-matrix">
              {completedLessons.length} / {totalLessonsCount} Completed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar bg-black">
            {CHAPTERS.map((ch) => {
              const isActiveChapter = activeChapter.id === ch.id;
              const chapterCompletedCount = ch.lessons.filter(l => completedLessons.includes(l.id)).length;
              const isChapterDone = chapterCompletedCount === ch.lessons.length && ch.lessons.length > 0;

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
                      {ch.number}
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
                            {chapterCompletedCount}/{ch.lessons.length}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-white/40 truncate mt-0.5">
                        {ch.description}
                      </p>
                    </div>
                  </button>

                  {/* Lessons */}
                  {isActiveChapter && (
                    <div className="bg-black/80 py-1.5 px-3 space-y-1 border-t border-b border-white/5">
                      {ch.lessons.map((les) => {
                        const isSelectedLesson = activeLesson.id === les.id;
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
                                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent font-mono'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-matrix shrink-0" />
                              ) : isSelectedLesson ? (
                                <Play className="w-3.5 h-3.5 text-matrix fill-matrix shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-white/30 shrink-0" />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>
                            <span className="font-mono text-[10px] text-white/40 shrink-0">
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
                <span>CHAPTER {activeChapter.number}</span>
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

          {/* VIDEO CINEMA CONTAINER (Matching blueprint-landing video cards) */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-matrix/50 bg-black shadow-[0_0_50px_rgba(0,230,90,0.15)] group">
            <iframe
              src={activeLesson.videoUrl}
              title={activeLesson.title}
              className="w-full h-full border-0 rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
                  <span className="hidden sm:inline">Previous: {prevLesson.title}</span>
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
                1. Overview & Action Plan
              </button>

              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'resources'
                    ? 'border-matrix text-matrix font-bold'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>2. Resources ({activeLesson.resources.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'notes'
                    ? 'border-matrix text-matrix font-bold'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>3. Lesson Notes</span>
                {noteContent && <span className="w-2 h-2 rounded-full bg-matrix" />}
              </button>

              <button
                onClick={() => setActiveTab('software')}
                className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'software'
                    ? 'border-gold text-gold font-bold'
                    : 'border-transparent text-white/50 hover:text-gold'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-gold" />
                <span>4. Software Platform</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">Lesson Breakdown</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {activeLesson.description}
                  </p>
                </div>

                {/* Implementation Checklist */}
                <div className="p-5 rounded-xl border border-matrix/30 bg-black/60 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-matrix flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" /> Implementation Action Items
                    </span>
                    <span className="font-mono text-[10px] text-white/40">
                      Check off as you complete
                    </span>
                  </div>

                  <div className="space-y-2">
                    {actionItems.map((item, idx) => {
                      const isChecked = !!checklist[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleChecklistItem(idx)}
                          className={`w-full text-left p-3 rounded border flex items-start gap-3 transition cursor-pointer ${
                            isChecked
                              ? 'bg-matrix/10 border-matrix/40 text-white/50'
                              : 'bg-white/[0.02] border-white/10 text-white/90 hover:border-matrix/30'
                          }`}
                        >
                          <div className="mt-0.5 text-matrix shrink-0">
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-white/40" />}
                          </div>
                          <span className={`text-xs md:text-sm leading-relaxed ${isChecked ? 'line-through text-white/40' : 'text-white/90'}`}>
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gold/30 bg-gold/5 font-mono text-xs space-y-1">
                  <div className="text-gold font-bold uppercase tracking-wider">// Chapter Core Objective:</div>
                  <div className="text-white/80">{activeChapter.description}</div>
                </div>
              </div>
            )}

            {/* TAB 2: RESOURCES */}
            {activeTab === 'resources' && (
              <div className="space-y-4">
                <p className="font-mono text-xs text-white/50">
                  Download templates, worksheets, and cold outreach scripts for this lesson:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeLesson.resources.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-matrix/50 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className="p-2.5 rounded bg-matrix/10 text-matrix group-hover:bg-matrix group-hover:text-black transition">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-display text-sm font-bold text-white block truncate">{res.title}</span>
                          <span className="font-mono text-[10px] text-matrix uppercase">{res.type} Format</span>
                        </div>
                      </div>

                      <a
                        href={res.url}
                        download
                        className="btn-ghost-matrix !py-1.5 !px-3 !text-xs shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="font-mono text-xs text-white/60 uppercase">
                    Personal Action Notes for: <strong className="text-white">{activeLesson.title}</strong>
                  </label>

                  <div className="flex items-center gap-2">
                    {noteSavedNotice && (
                      <span className="font-mono text-xs text-matrix font-bold animate-fade-in">
                        ✓ Saved!
                      </span>
                    )}
                    <button
                      onClick={handleDownloadNotes}
                      disabled={!noteContent}
                      className="btn-ghost-matrix !py-1.5 !px-3 !text-xs disabled:opacity-40"
                    >
                      Export .txt
                    </button>
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="btn-gold !py-1.5 !px-3.5 !text-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingNote ? 'Saving...' : 'Save Notes'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={9}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record your action items, target niches, and discovery notes here..."
                  className="w-full bg-black/60 border border-white/10 focus:border-matrix rounded-xl p-4 text-sm text-white placeholder-white/30 outline-none font-mono leading-relaxed transition"
                />
              </div>
            )}

            {/* TAB 4: SOFTWARE VAULT */}
            {activeTab === 'software' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-black text-xl text-white mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gold fill-gold" /> BPO Accelerator Automated Software Suite
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Automate lead scraping, cold outreach, and client proposals with the complete software ecosystem.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1.5">
                    <span className="font-mono text-xs font-bold text-matrix block">01. AI Lead Scraper & Prospector</span>
                    <p className="text-xs text-white/60">Extract verified decision-maker emails, phone numbers, and company revenues in seconds.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1.5">
                    <span className="font-mono text-xs font-bold text-matrix block">02. Proposal & Contract Builder</span>
                    <p className="text-xs text-white/60">Generate high-converting custom agency proposals and contracts in 1 click.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1.5">
                    <span className="font-mono text-xs font-bold text-matrix block">03. Weekly Live Zoom Coaching</span>
                    <p className="text-xs text-white/60">Join Chris McLaren weekly to review lead campaigns and close deals live.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1.5">
                    <span className="font-mono text-xs font-bold text-matrix block">04. VIP Community Network</span>
                    <p className="text-xs text-white/60">Network with 6-figure agency owners, exchange talent, and partner on contracts.</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-gold/40 bg-gradient-to-r from-gold/10 to-matrix/10 text-center space-y-3">
                  <h4 className="font-display font-black text-xl text-white">
                    Exclusive Student Privilege: 50% OFF
                  </h4>
                  <p className="text-xs text-white/70 max-w-md mx-auto">
                    Use your blueprint student discount to unlock the full BPO Accelerator software platform.
                  </p>
                  <button
                    onClick={() => setShowUpsellModal(true)}
                    className="btn-gold !py-3 !px-8 !text-xs mt-2"
                  >
                    Claim 50% OFF Software →
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 4. UPGRADE MODAL */}
      {showUpsellModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gold/40 bg-black p-6 md:p-8 space-y-5 relative shadow-[0_0_60px_rgba(212,175,55,0.2)]">
            <button
              onClick={() => setShowUpsellModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 font-mono text-[10px] uppercase font-bold text-gold">
                ⚡ Exclusive Student Upgrade
              </span>
              <h3 className="font-display font-black text-2xl text-white">
                BPO Accelerator Software & Live Coaching
              </h3>
              <p className="text-xs text-white/60">
                Automate your outreach with lead scrapers, proposal generators, and weekly live calls with Chris McLaren.
              </p>
            </div>

            <div className="space-y-2 text-xs text-white/80 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-matrix shrink-0" />
                <span>Unlimited verified B2B email and LinkedIn lead scraping</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-matrix shrink-0" />
                <span>AI agency proposal and contract generator</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-matrix shrink-0" />
                <span>Weekly live Zoom deal breakdown & coaching sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-matrix shrink-0" />
                <span>Exclusive VIP Discord access with top agency operators</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className="text-white/40 line-through text-base font-mono">R2,499/mo</span>
                <span className="text-matrix font-black text-2xl font-mono">R1,249.50</span>
                <span className="px-2 py-0.5 rounded bg-matrix/20 text-matrix font-mono text-[10px] font-bold">
                  50% OFF FIRST MONTH
                </span>
              </div>

              <a
                href="https://whop.com/checkout/plan_OJny69V9b2Utm?promo=50OFF"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full !py-3.5 !text-xs font-bold"
              >
                Claim 50% Coupon & Upgrade →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 5. LOG EARNINGS MODAL */}
      <LogEarningsModal
        isOpen={showEarningsModal}
        onClose={() => setShowEarningsModal(false)}
        userId={user.id}
        onEarningsUpdated={(total) => setUserTotalEarnings(total)}
      />
    </div>
  );
}
