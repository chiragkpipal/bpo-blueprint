'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CHAPTERS, Chapter, Lesson } from '@/lib/courseData';
import {
  Play, CheckCircle2, Circle, FileText, Download, Save, Sparkles,
  LogOut, ChevronRight, ChevronDown, BookOpen, Layers, Zap, X,
  Trophy, MessageCircle, Check, ArrowRight, ArrowLeft, Clock,
  Search, Shield, CheckSquare, Square, Share2
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
  const [searchQuery, setSearchQuery] = useState('');

  // Action checklist state per lesson stored locally
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
      // Load saved checklist for this lesson from localStorage
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

  // Find flattened lesson list for Prev / Next navigation
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

  // Calculate total course completion percentage
  const totalLessonsCount = allLessons.length;
  const completionPercentage = Math.round((completedLessons.length / (totalLessonsCount || 1)) * 100);

  // Lesson action checklist items generator based on chapter
  const actionItems = useMemo(() => {
    switch (activeChapter.id) {
      case 'ch-01':
        return [
          "Understand the core profit dynamics of the BPO middleman business model.",
          "Identify 3 primary international target markets (e.g. US, UK, Australia).",
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#00ff66] selection:text-black">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-[#00ff66] transition cursor-pointer"
            aria-label="Toggle Curriculum"
          >
            <Layers className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[#00ff66] font-mono text-xs tracking-widest">[◉]</span>
            <span className="font-display font-black text-lg md:text-xl tracking-[0.15em] text-white">
              BPO<span className="text-[#d4af37]">.</span>BLUEPRINT
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 font-mono text-[10px] font-bold uppercase tracking-wider">
              Student Portal
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="hidden md:flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-1.5 rounded-full">
          <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider">Progress:</span>
          <div className="w-28 lg:w-36 bg-white/10 h-2 rounded-full overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-[#00ff66] via-[#00cc52] to-[#d4af37] h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold font-mono text-[#00ff66]">{completionPercentage}%</span>
          <span className="text-[10px] font-mono text-white/40">({completedLessons.length}/{totalLessonsCount})</span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Earnings Deal Tracker Button */}
          <button
            onClick={() => setShowEarningsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00ff66]/15 hover:bg-[#00ff66]/25 border border-[#00ff66]/40 text-[#00ff66] font-bold text-xs transition cursor-pointer"
            title="Log verified client deals & track your earnings"
          >
            <Trophy className="w-3.5 h-3.5 text-[#00ff66]" />
            <span className="hidden sm:inline font-mono uppercase text-[11px]">Log Deals</span>
            <span className="bg-[#00ff66] text-black font-black text-[10px] px-1.5 py-0.5 rounded font-mono">
              R{userTotalEarnings >= 1000 ? `${Math.round(userTotalEarnings / 1000)}k` : userTotalEarnings.toLocaleString()}
            </span>
          </button>

          {/* 50+ Real Work Examples Add-on */}
          <a
            href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 font-bold text-xs transition cursor-pointer"
            title="50+ Real Client Websites, Apps, Games & Logos to win deals"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00ff66]" />
            <span className="text-xs">50+ Work Examples</span>
          </a>

          {/* Software Upgrade Pill */}
          <button
            onClick={() => setShowUpsellModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-extrabold text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span className="hidden sm:inline">50% OFF App</span>
            <span className="sm:hidden">Upgrade</span>
          </button>

          {/* Student Profile Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00ff66]/30 to-[#d4af37]/30 border border-white/20 flex items-center justify-center text-[11px] font-mono font-bold text-white">
              {(user.fullName || user.email || 'S').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-white/40 hover:text-red-400 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. UPSELL & COMMUNITY TICKER */}
      <div className="bg-gradient-to-r from-[#d4af37]/15 via-[#00ff66]/10 to-[#d4af37]/15 border-b border-[#d4af37]/25 px-4 py-2 text-center flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
          <span className="text-white/90">
            <strong className="text-[#d4af37] uppercase font-bold">Student Advantage:</strong> Get the BPO Accelerator Automated Lead Bots & Coaching with{' '}
            <span className="text-[#00ff66] font-bold underline cursor-pointer" onClick={() => setShowUpsellModal(true)}>
              50% OFF your first month
            </span>!
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpsellModal(true)}
            className="font-mono text-[#d4af37] font-bold hover:text-white transition cursor-pointer flex items-center gap-1"
          >
            Claim 50% Coupon →
          </button>
          <span className="text-white/20">|</span>
          <a
            href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[#00ff66] font-bold hover:underline transition"
          >
            50+ Portfolio Assets (R2,000) →
          </a>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-hidden relative">
        {/* SIDEBAR: CHAPTER & LESSON CURRICULUM */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-80 sm:w-96 lg:w-84 xl:w-96 bg-[#080808] border-r border-white/10 flex flex-col shrink-0 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0 top-[96px] bottom-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Top Header */}
          <div className="p-4 border-b border-white/10 bg-[#0c0c0c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00ff66]" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-white/80">
                Curriculum
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-[#00ff66] font-bold">
                {completedLessons.length} / {totalLessonsCount} Done
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chapter Accordion List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar bg-[#060606]">
            {CHAPTERS.map((ch) => {
              const isActiveChapter = activeChapter.id === ch.id;
              const chapterCompletedCount = ch.lessons.filter(l => completedLessons.includes(l.id)).length;
              const isChapterDone = chapterCompletedCount === ch.lessons.length && ch.lessons.length > 0;

              return (
                <div key={ch.id} className="bg-transparent transition-colors">
                  {/* Chapter Header Card */}
                  <button
                    onClick={() => setActiveChapter(ch)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                      isActiveChapter ? 'bg-white/[0.04] border-l-2 border-[#00ff66]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className={`font-mono text-xs font-black shrink-0 mt-0.5 ${
                      isChapterDone ? 'text-[#00ff66]' : isActiveChapter ? 'text-[#00ff66]' : 'text-[#d4af37]'
                    }`}>
                      {ch.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-sm font-bold truncate ${isActiveChapter ? 'text-white' : 'text-white/80'}`}>
                          {ch.title}
                        </h3>
                        {isChapterDone ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-[#00ff66] bg-[#00ff66]/10 px-1.5 py-0.5 rounded border border-[#00ff66]/20 shrink-0 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-white/40 shrink-0">
                            {chapterCompletedCount}/{ch.lessons.length}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40 truncate mt-0.5">
                        {ch.description}
                      </p>
                    </div>
                  </button>

                  {/* Lessons list inside active chapter */}
                  {isActiveChapter && (
                    <div className="bg-black/60 py-1.5 pl-3 pr-2 space-y-1">
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
                            className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                              isSelectedLesson
                                ? 'bg-[#00ff66]/15 text-[#00ff66] font-bold border border-[#00ff66]/40 shadow-[0_0_15px_rgba(0,255,102,0.1)]'
                                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                              ) : isSelectedLesson ? (
                                <Play className="w-3.5 h-3.5 text-[#00ff66] fill-[#00ff66] shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-white/30 shrink-0" />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/40 shrink-0">
                              <Clock className="w-3 h-3" />
                              <span>{les.duration}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SIDEBAR FOOTER WIDGETS */}
          <div className="p-3 border-t border-white/10 bg-[#0a0a0a] space-y-2.5">
            {/* Student Earnings Tracker */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#00ff66]/10 text-[#00ff66] shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-white/50 block truncate">Total Verified</span>
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

            {/* 50+ Work Examples link */}
            <a
              href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 rounded-xl bg-white/[0.02] hover:bg-[#00ff66]/10 border border-white/10 hover:border-[#00ff66]/30 transition group cursor-pointer"
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
                Real client websites, apps, games & logos to show leads.
              </p>
            </a>
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* MAIN VIDEO & STUDY HUB STAGE */}
        <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-10 overflow-y-auto space-y-6 max-w-6xl mx-auto w-full">
          {/* Chapter & Lesson Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-[#00ff66] uppercase tracking-wider">
                <span>CHAPTER {activeChapter.number}</span>
                <span>/</span>
                <span className="text-white/60">{activeChapter.title}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight mt-1">
                {activeLesson.title}
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleToggleCompleted}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer border ${
                  completedLessons.includes(activeLesson.id)
                    ? 'bg-[#00ff66]/15 text-[#00ff66] border-[#00ff66]/50 shadow-[0_0_20px_rgba(0,255,102,0.2)]'
                    : 'bg-white/5 text-white/70 border-white/15 hover:border-[#00ff66]/40 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedLessons.includes(activeLesson.id) ? 'Completed ✓' : 'Mark Completed'}</span>
              </button>
            </div>
          </div>

          {/* CINEMATIC VIDEO PLAYER WITH AMBIENT GLOW */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black shadow-[0_0_50px_rgba(0,0,0,0.9)] group">
            {/* Ambient matrix radial light behind video */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#00ff66]/10 via-transparent to-[#d4af37]/10 rounded-2xl blur-xl pointer-events-none" />

            <iframe
              src={activeLesson.videoUrl}
              title={activeLesson.title}
              className="relative w-full h-full border-0 rounded-2xl z-10"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* LESSON NAVIGATION CONTROLS BAR */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl glass-panel border border-white/10">
            <div>
              {prevLesson ? (
                <button
                  onClick={() => navigateToLesson(prevLesson)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Previous: {prevLesson.title}</span>
                  <span className="sm:hidden">Previous</span>
                </button>
              ) : (
                <div className="text-xs font-mono text-white/30 px-3.5 py-2">
                  First Lesson
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCompleteAndNext}
                className="btn-gold !py-2.5 !px-5 !text-xs"
              >
                <span>{completedLessons.includes(activeLesson.id) ? 'Next Lesson' : 'Complete & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* INTERACTIVE STUDY HUB TABS */}
          <div className="glass-panel rounded-2xl border border-white/10 p-6 md:p-8 space-y-6">
            {/* Tab navigation headers */}
            <div className="flex items-center gap-3 sm:gap-6 border-b border-white/10 pb-3 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab('overview')}
                className={`font-mono text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition cursor-pointer shrink-0 ${
                  activeTab === 'overview' ? 'border-[#00ff66] text-[#00ff66]' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                1. Overview & Action Plan
              </button>

              <button
                onClick={() => setActiveTab('resources')}
                className={`font-mono text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'resources' ? 'border-[#00ff66] text-[#00ff66]' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>2. Resources & Scripts ({activeLesson.resources.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`font-mono text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'notes' ? 'border-[#00ff66] text-[#00ff66]' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>3. My Lesson Notes</span>
                {noteContent && <span className="w-2 h-2 rounded-full bg-[#00ff66]" />}
              </button>

              <button
                onClick={() => setActiveTab('software')}
                className={`font-mono text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'software' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-white/50 hover:text-[#d4af37]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-[#d4af37]" />
                <span>4. Software Vault</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW & ACTION PLAN */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">Lesson Breakdown</h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    {activeLesson.description}
                  </p>
                </div>

                {/* Interactive Action Checklist */}
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00ff66] flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" /> Implementation Action Items
                    </span>
                    <span className="font-mono text-[11px] text-white/40">
                      Check off as you complete
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {actionItems.map((item, idx) => {
                      const isChecked = !!checklist[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleChecklistItem(idx)}
                          className={`w-full text-left p-3 rounded-lg border flex items-start gap-3 transition cursor-pointer ${
                            isChecked
                              ? 'bg-[#00ff66]/10 border-[#00ff66]/30 text-white'
                              : 'bg-white/[0.02] border-white/5 text-white/70 hover:border-white/20'
                          }`}
                        >
                          <div className="mt-0.5 text-[#00ff66] shrink-0">
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-white/40" />}
                          </div>
                          <span className={`text-xs md:text-sm leading-relaxed ${isChecked ? 'line-through text-white/50' : 'text-white/90'}`}>
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-[#d4af37]/10 to-transparent border border-[#d4af37]/30 font-mono text-xs space-y-1">
                  <div className="text-[#d4af37] font-bold uppercase tracking-wider">Chapter Core Objective:</div>
                  <div className="text-white/80">{activeChapter.description}</div>
                </div>
              </div>
            )}

            {/* TAB 2: RESOURCES & SCRIPTS */}
            {activeTab === 'resources' && (
              <div className="space-y-4">
                <p className="text-xs text-white/60 font-mono">
                  Download battle-tested templates, contracts, worksheets, and cold outreach scripts for this lesson:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeLesson.resources.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00ff66]/40 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className="p-2.5 rounded-lg bg-[#00ff66]/10 text-[#00ff66] group-hover:bg-[#00ff66] group-hover:text-black transition">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-white block truncate">{res.title}</span>
                          <span className="text-[10px] font-mono text-[#00ff66] uppercase">{res.type} Document</span>
                        </div>
                      </div>

                      <a
                        href={res.url}
                        download
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-[#00ff66] hover:text-black border border-white/10 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>

                {/* Additional 50+ Work Examples Upsell Card */}
                <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-white/[0.03] to-[#d4af37]/10 border border-[#d4af37]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 font-mono text-[9px] font-bold text-[#d4af37] uppercase">
                      Agency Portfolio Vault
                    </span>
                    <h4 className="font-display font-bold text-white text-base mt-1">Need a Proven Portfolio to Show Overseas Clients?</h4>
                    <p className="text-xs text-white/60 mt-0.5">
                      Get 50+ live client websites, mobile apps, games & brand logos with full white-label rights to close high-ticket retainers.
                    </p>
                  </div>
                  <a
                    href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#d4af37] text-black font-extrabold text-xs hover:brightness-110 transition shrink-0 cursor-pointer"
                  >
                    Unlock 50+ Portfolio (R2,000) →
                  </a>
                </div>
              </div>
            )}

            {/* TAB 3: PRIVATE NOTEPAD */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="font-mono text-xs text-white/60 uppercase">
                    Personal Action Notes for: <strong className="text-white">{activeLesson.title}</strong>
                  </label>

                  <div className="flex items-center gap-2">
                    {noteSavedNotice && (
                      <span className="text-xs text-[#00ff66] font-mono font-bold animate-fade-in">
                        ✓ Saved to Cloud!
                      </span>
                    )}
                    <button
                      onClick={handleDownloadNotes}
                      disabled={!noteContent}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-white/80 transition cursor-pointer disabled:opacity-40"
                    >
                      Export .txt
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
                  rows={10}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record your breakthroughs, target niche criteria, discovery questions, and outreach ideas here..."
                  className="w-full bg-black/60 border border-white/15 focus:border-[#00ff66] rounded-xl p-4 text-sm text-white placeholder-white/30 outline-none font-mono leading-relaxed transition shadow-inner"
                />
              </div>
            )}

            {/* TAB 4: SOFTWARE VAULT */}
            {activeTab === 'software' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" /> BPO Accelerator Automated Software Suite
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Automate lead finding, cold emailing, client proposals, and team outsourcing with our proprietary software tools.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <span className="font-mono text-xs font-bold text-[#00ff66]">01. AI Lead Scraper & Prospector</span>
                    <p className="text-xs text-white/60">Find verified decision-maker emails, phone numbers, and company revenues in seconds.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <span className="font-mono text-xs font-bold text-[#00ff66]">02. Auto-Proposal Generator</span>
                    <p className="text-xs text-white/60">Generate high-converting custom agency proposals and contracts with 1 click.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <span className="font-mono text-xs font-bold text-[#00ff66]">03. Live Weekly Deal Coaching Calls</span>
                    <p className="text-xs text-white/60">Hop on live calls every week with Chris McLaren to review leads and close deals.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <span className="font-mono text-xs font-bold text-[#00ff66]">04. VIP Agency Discord Community</span>
                    <p className="text-xs text-white/60">Network with 6-figure BPO agency owners, share talent, and close joint ventures.</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-r from-[#d4af37]/20 via-[#00ff66]/10 to-[#d4af37]/20 border border-[#d4af37]/40 text-center space-y-3">
                  <h4 className="font-display font-black text-xl text-white">
                    Special Blueprint Member Discount: 50% OFF
                  </h4>
                  <p className="text-xs text-white/70 max-w-md mx-auto">
                    Use your exclusive blueprint student discount to unlock the full BPO Accelerator software platform.
                  </p>
                  <button
                    onClick={() => setShowUpsellModal(true)}
                    className="btn-gold !py-3 !px-8 !text-xs mt-2"
                  >
                    Claim 50% Coupon & Access Software →
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 4. UPGRADE / UPSELL MODAL */}
      {showUpsellModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-2xl border border-[#d4af37]/40 p-6 md:p-8 space-y-5 relative shadow-[0_0_80px_rgba(212,175,55,0.25)]">
            <button
              onClick={() => setShowUpsellModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 font-mono text-[10px] uppercase font-bold text-[#d4af37]">
                ⚡ Exclusive Blueprint Member Upgrade
              </span>
              <h3 className="font-display font-black text-2xl text-white">
                BPO Accelerator Software & Live Mentorship
              </h3>
              <p className="text-xs text-white/60">
                Supercharge your outreach with automated bots, proposal templates, and weekly live calls with Chris McLaren.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-white/80 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00ff66] shrink-0" />
                <span>Unlimited verified B2B email and LinkedIn lead scraping</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00ff66] shrink-0" />
                <span>One-click AI agency proposal and contract builder</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00ff66] shrink-0" />
                <span>Weekly live Zoom deal breakdown & coaching calls</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00ff66] shrink-0" />
                <span>Exclusive VIP Discord access with top agency operators</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className="text-white/40 line-through text-base font-mono">R2,499/mo</span>
                <span className="text-[#00ff66] font-black text-2xl font-mono">R1,249.50</span>
                <span className="px-2 py-0.5 rounded bg-[#00ff66]/20 text-[#00ff66] font-mono text-[10px] font-bold">
                  50% OFF FIRST MONTH
                </span>
              </div>

              <a
                href="https://whop.com/checkout/plan_OJny69V9b2Utm?promo=50OFF"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold !py-3.5 w-full !text-xs"
              >
                Claim 50% OFF & Upgrade Now →
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
