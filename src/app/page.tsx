'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CHAPTERS, Chapter, Lesson } from '@/lib/courseData';
import {
  Play, CheckCircle2, Circle, FileText, Download, Save, Sparkles,
  LogOut, ChevronRight, ChevronDown, BookOpen, Layers, Zap, X,
  Trophy, ArrowRight, ArrowLeft, Clock, CheckSquare, Square,
  ExternalLink, FileSpreadsheet, FileCode, Check
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
    <div className="min-h-screen bg-[#090a0f] text-[#f8fafc] flex flex-col font-sans selection:bg-[#00f076] selection:text-black">
      {/* 1. TOP APP BAR */}
      <header className="sticky top-0 z-50 bg-[#090a0f]/90 backdrop-blur-xl border-b border-white/[0.07] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Toggle Curriculum"
          >
            <Layers className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#00f076]/10 border border-[#00f076]/30 flex items-center justify-center text-[#00f076] font-mono text-xs font-bold">
              B
            </div>
            <span className="font-display font-extrabold text-base md:text-lg tracking-tight text-white">
              BPO Blueprint
            </span>
          </div>

          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] font-mono text-[10px] font-semibold text-slate-300 uppercase tracking-wider ml-1">
            Student Portal
          </span>
        </div>

        {/* Global Progress Bar */}
        <div className="hidden md:flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] px-3.5 py-1.5 rounded-full">
          <span className="text-[11px] font-medium text-slate-400">Course Progress:</span>
          <div className="w-28 lg:w-36 bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#00f076] h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-xs font-mono font-semibold text-[#00f076]">{completionPercentage}%</span>
          <span className="text-[11px] font-mono text-slate-500">({completedLessons.length}/{totalLessonsCount})</span>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Earnings Deal Tracker */}
          <button
            onClick={() => setShowEarningsModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-semibold text-xs transition cursor-pointer"
            title="Log verified client deals & track earnings"
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-slate-300">Earnings:</span>
            <span className="font-mono font-bold text-[#00f076]">
              R{userTotalEarnings >= 1000 ? `${Math.round(userTotalEarnings / 1000)}k` : userTotalEarnings.toLocaleString()}
            </span>
          </button>

          {/* 50+ Work Examples */}
          <a
            href="https://www.fanbasis.com/agency-checkout/bpoaccelerator/l8V9g"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 font-medium text-xs transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00f076]" />
            <span>50+ Work Examples</span>
          </a>

          {/* Software Upgrade */}
          <button
            onClick={() => setShowUpsellModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            <span className="hidden sm:inline">50% OFF Software</span>
            <span className="sm:hidden">50% OFF</span>
          </button>

          {/* User initials & logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-200">
              {(user.fullName || user.email || 'S').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-hidden relative">
        {/* SIDEBAR: CHAPTERS & LESSONS */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-80 sm:w-88 lg:w-80 xl:w-88 bg-[#0b0d13] border-r border-white/[0.07] flex flex-col shrink-0 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0 top-[57px] bottom-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-white/[0.07] bg-[#0d0f17] flex items-center justify-between">
            <span className="font-display font-semibold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#00f076]" /> Course Syllabus
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-400">
              {completedLessons.length} / {totalLessonsCount} Completed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] custom-scrollbar bg-[#0b0d13]">
            {CHAPTERS.map((ch) => {
              const isActiveChapter = activeChapter.id === ch.id;
              const chapterCompletedCount = ch.lessons.filter(l => completedLessons.includes(l.id)).length;
              const isChapterDone = chapterCompletedCount === ch.lessons.length && ch.lessons.length > 0;

              return (
                <div key={ch.id} className="bg-transparent">
                  {/* Chapter Header */}
                  <button
                    onClick={() => setActiveChapter(ch)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      isActiveChapter ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5 ${
                      isChapterDone ? 'bg-emerald-500/20 text-emerald-400' : isActiveChapter ? 'bg-[#00f076]/15 text-[#00f076]' : 'bg-white/[0.05] text-slate-400'
                    }`}>
                      {ch.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-sm font-semibold truncate ${isActiveChapter ? 'text-white' : 'text-slate-300'}`}>
                          {ch.title}
                        </h3>
                        {isChapterDone ? (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-500 shrink-0">
                            {chapterCompletedCount}/{ch.lessons.length}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {ch.description}
                      </p>
                    </div>
                  </button>

                  {/* Lessons in Chapter */}
                  {isActiveChapter && (
                    <div className="bg-[#08090d] py-1 px-2 space-y-0.5 border-t border-b border-white/[0.04]">
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
                            className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                              isSelectedLesson
                                ? 'bg-[#00f076]/10 text-[#00f076] font-semibold border border-[#00f076]/25'
                                : 'text-slate-300 hover:text-white hover:bg-white/[0.04] border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : isSelectedLesson ? (
                                <Play className="w-3.5 h-3.5 text-[#00f076] fill-[#00f076] shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-500 shrink-0">
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

          {/* Sidebar Bottom Promo */}
          <div className="p-3 border-t border-white/[0.07] bg-[#090a0f] space-y-2">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-medium text-slate-400 block truncate">My Client Deals</span>
                  <span className="text-xs font-mono font-bold text-[#00f076] truncate block">
                    R{userTotalEarnings.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowEarningsModal(true)}
                className="btn-primary !py-1 !px-2.5 !text-[11px]"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* MAIN VIDEO & STUDY HUB */}
        <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-10 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
          {/* Header breadcrumb & title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#00f076] uppercase tracking-wider font-semibold">
                <span>Chapter {activeChapter.number}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{activeChapter.title}</span>
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight mt-1">
                {activeLesson.title}
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleToggleCompleted}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  completedLessons.includes(activeLesson.id)
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:border-white/20 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedLessons.includes(activeLesson.id) ? 'Completed ✓' : 'Mark Complete'}</span>
              </button>
            </div>
          </div>

          {/* VIDEO CINEMA CONTAINER */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-black shadow-2xl">
            <iframe
              src={activeLesson.videoUrl}
              title={activeLesson.title}
              className="w-full h-full border-0 rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* LESSON NAVIGATION BAR */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl card-premium">
            <div>
              {prevLesson ? (
                <button
                  onClick={() => navigateToLesson(prevLesson)}
                  className="btn-secondary !py-2 !px-3.5 !text-xs font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Previous: {prevLesson.title}</span>
                  <span className="sm:hidden">Previous</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500 px-3 py-2 font-mono">First Lesson</span>
              )}
            </div>

            <div>
              <button
                onClick={handleCompleteAndNext}
                className="btn-primary !py-2 !px-4 !text-xs"
              >
                <span>{completedLessons.includes(activeLesson.id) ? 'Next Lesson' : 'Complete & Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* INTERACTIVE STUDY HUB */}
          <div className="card-premium p-6 md:p-8 space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-white/[0.07] pb-3 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                Overview & Action Plan
              </button>

              <button
                onClick={() => setActiveTab('resources')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'resources'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Resources ({activeLesson.resources.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'notes'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Private Notes</span>
                {noteContent && <span className="w-1.5 h-1.5 rounded-full bg-[#00f076]" />}
              </button>

              <button
                onClick={() => setActiveTab('software')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'software'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-amber-300" />
                <span>Software Suite</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-base text-white mb-2">Lesson Breakdown</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {activeLesson.description}
                  </p>
                </div>

                {/* Implementation Checklist */}
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-slate-200 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-[#00f076]" /> Action Items to Complete
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Check off as you implement
                    </span>
                  </div>

                  <div className="space-y-2">
                    {actionItems.map((item, idx) => {
                      const isChecked = !!checklist[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleChecklistItem(idx)}
                          className={`w-full text-left p-3 rounded-lg border flex items-start gap-3 transition cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500/25 text-slate-400'
                              : 'bg-white/[0.02] border-white/[0.05] text-slate-200 hover:border-white/15'
                          }`}
                        >
                          <div className="mt-0.5 text-[#00f076] shrink-0">
                            {isChecked ? <CheckSquare className="w-4 h-4 text-[#00f076]" /> : <Square className="w-4 h-4 text-slate-500" />}
                          </div>
                          <span className={`text-xs md:text-sm leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs space-y-1">
                  <div className="font-semibold text-slate-400 uppercase font-mono text-[10px]">Chapter Objective:</div>
                  <div className="text-slate-300">{activeChapter.description}</div>
                </div>
              </div>
            )}

            {/* TAB 2: RESOURCES */}
            {activeTab === 'resources' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Templates, worksheets, and cold outreach scripts for this lesson:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeLesson.resources.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl card-premium-interactive"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className="p-2.5 rounded-lg bg-white/[0.05] text-slate-300">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-white block truncate">{res.title}</span>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">{res.type}</span>
                        </div>
                      </div>

                      <a
                        href={res.url}
                        download
                        className="btn-secondary !py-1.5 !px-3 !text-xs shrink-0"
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
                  <label className="text-xs font-medium text-slate-400">
                    Private Lesson Notes:
                  </label>

                  <div className="flex items-center gap-2">
                    {noteSavedNotice && (
                      <span className="text-xs text-[#00f076] font-medium animate-fade-in">
                        ✓ Saved
                      </span>
                    )}
                    <button
                      onClick={handleDownloadNotes}
                      disabled={!noteContent}
                      className="btn-secondary !py-1.5 !px-3 !text-xs disabled:opacity-40"
                    >
                      Export .txt
                    </button>
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="btn-primary !py-1.5 !px-3.5 !text-xs"
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
                  className="w-full bg-[#07080c] border border-white/[0.08] focus:border-[#00f076]/50 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 outline-none leading-relaxed transition"
                />
              </div>
            )}

            {/* TAB 4: SOFTWARE VAULT */}
            {activeTab === 'software' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> BPO Accelerator Automated Software Platform
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Automate lead scraping, cold outreach, and client proposals with the complete software ecosystem.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                    <span className="text-xs font-semibold text-[#00f076] block">01. AI Lead Scraper & Prospector</span>
                    <p className="text-xs text-slate-400">Extract verified decision-maker emails, phone numbers, and company revenues in seconds.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                    <span className="text-xs font-semibold text-[#00f076] block">02. Proposal & Contract Builder</span>
                    <p className="text-xs text-slate-400">Generate high-converting custom agency proposals and contracts in 1 click.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                    <span className="text-xs font-semibold text-[#00f076] block">03. Weekly Live Zoom Coaching</span>
                    <p className="text-xs text-slate-400">Join Chris McLaren weekly to review lead campaigns and close deals live.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                    <span className="text-xs font-semibold text-[#00f076] block">04. VIP Community Network</span>
                    <p className="text-xs text-slate-400">Network with 6-figure agency owners, exchange talent, and partner on contracts.</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-amber-500/10 border border-amber-500/25 text-center space-y-3">
                  <h4 className="font-display font-bold text-lg text-white">
                    Exclusive Student Privilege: 50% OFF
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Use your blueprint student discount to unlock the full BPO Accelerator software platform.
                  </p>
                  <button
                    onClick={() => setShowUpsellModal(true)}
                    className="btn-gold-action !py-2.5 !px-6 !text-xs mt-2"
                  >
                    Claim 50% OFF Software →
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. UPSELL MODAL */}
      {showUpsellModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg card-premium p-6 md:p-8 space-y-5 relative border-amber-500/30">
            <button
              onClick={() => setShowUpsellModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 font-mono text-[10px] uppercase font-semibold text-amber-300">
                ⚡ Student Upgrade
              </span>
              <h3 className="font-display font-bold text-2xl text-white">
                BPO Accelerator Software & Live Coaching
              </h3>
              <p className="text-xs text-slate-400">
                Automate your outreach with lead scrapers, proposal generators, and weekly live calls with Chris McLaren.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00f076] shrink-0" />
                <span>Unlimited verified B2B email and LinkedIn lead scraping</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00f076] shrink-0" />
                <span>AI agency proposal and contract generator</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00f076] shrink-0" />
                <span>Weekly live Zoom deal breakdown & coaching sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00f076] shrink-0" />
                <span>Exclusive VIP Discord access with top agency operators</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className="text-slate-500 line-through text-sm font-mono">R2,499/mo</span>
                <span className="text-[#00f076] font-bold text-2xl font-mono">R1,249.50</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold">
                  50% OFF FIRST MONTH
                </span>
              </div>

              <a
                href="https://whop.com/checkout/plan_OJny69V9b2Utm?promo=50OFF"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full !py-3 !text-xs font-bold"
              >
                Claim 50% Coupon & Upgrade →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. EARNINGS MODAL */}
      <LogEarningsModal
        isOpen={showEarningsModal}
        onClose={() => setShowEarningsModal(false)}
        userId={user.id}
        onEarningsUpdated={(total) => setUserTotalEarnings(total)}
      />
    </div>
  );
}
