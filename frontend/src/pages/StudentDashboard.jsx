import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, Sparkles, Flame, Award, Clock, ArrowRight, 
  CheckCircle, Play, ChevronRight, HardDrive, Target, HelpCircle, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentDashboard({ setCurrentPage, setSelectedLessonId, setSelectedChapterSlug }) {
  const { user, studentProfile } = useAuth();
  const { isOnline } = useOffline();
  const { lang, t } = useLanguage();
  const isEn = lang === 'en';

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(8);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard(user?.id);
      setDashboardData(data);
    } catch (e) {
      console.warn('Dashboard API failed, using cached/fallback profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const streak = dashboardData?.stats?.streak_days || studentProfile?.streak_days || 4;
  const points = dashboardData?.stats?.total_points || studentProfile?.total_points || 240;
  const progressPct = dashboardData?.stats?.progress_percentage || 25;
  const completedLessons = dashboardData?.stats?.completed_lessons || 1;
  const totalLessons = dashboardData?.stats?.total_lessons || 6;
  const continueLesson = dashboardData?.continue_lesson;
  const recentQuizzes = dashboardData?.recent_quizzes || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Top Banner / Student Greeting & Persona Card */}
      <div className="bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30 shrink-0">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {isEn ? `Welcome back, Raju!` : `నమస్కారం, ${user?.full_name?.split(' ')[0] || 'రాజు'}!`}
                </h1>
                <span className="bg-white/25 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  {isEn ? "Class 8" : "8వ తరగతి"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-orange-100 mt-0.5">
                {isEn ? "ZPHS High School, Chevella" : (user?.school_name || "జిల్లా పరిషత్ ఉన్నత పాఠశాల (ZPHS)")}
              </p>
            </div>
          </div>

          {/* Quick Badges: Streak & Coins */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-start">
            
            {/* Streak */}
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-white/10">
              <Flame className="w-5 h-5 text-amber-300 fill-amber-400" />
              <div>
                <div className="text-[10px] text-orange-200 uppercase font-bold tracking-wider">
                  {isEn ? "Streak" : "నిరంతర సాధన"}
                </div>
                <div className="text-base font-black leading-tight text-white">
                  {streak} {isEn ? "Days" : "రోజులు"}
                </div>
              </div>
            </div>

            {/* Points / Coins */}
            <div 
              onClick={() => setCurrentPage('progress')}
              className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-white/10 cursor-pointer hover:bg-black/30 transition-colors"
            >
              <Award className="w-5 h-5 text-amber-300 fill-amber-300" />
              <div>
                <div className="text-[10px] text-orange-200 uppercase font-bold tracking-wider">
                  {isEn ? "Coins" : "నాణేలు"}
                </div>
                <div className="text-base font-black leading-tight text-white">{points} ⭐</div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Class and Subject Selection Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Class Selection Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">
            {isEn ? "Class:" : "తరగతి:"}
          </span>
          {[8, 9, 10].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedClass === c
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isEn ? `Class ${c}` : `${c}వ తరగతి`} {c === 8 && '✓'}
            </button>
          ))}
        </div>

        {/* Subject Selection Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">
            {isEn ? "Subject:" : "విషయం:"}
          </span>
          <button
            onClick={() => setSelectedSubject('Mathematics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSubject === 'Mathematics'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isEn ? "Mathematics" : "గణితం (Mathematics)"}
          </button>
          <span className="text-[11px] text-slate-400 italic hidden sm:inline">
            {isEn ? "Science coming soon..." : "సైన్స్ త్వరలో..."}
          </span>
        </div>

      </div>

      {/* Primary Action Rows: Daily Target & Continue Learning Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Continue Learning Banner */}
        <div className="md:col-span-2 bg-linear-to-br from-white to-orange-50/40 rounded-3xl p-6 border-2 border-orange-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
                <Play className="w-3.5 h-3.5 fill-orange-700 text-orange-700" />
                <span>{isEn ? "Continue Learning" : "నేర్చుకోవడం కొనసాగించండి (Continue Learning)"}</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isEn ? `Completed: ${completedLessons}/${totalLessons} lessons` : `పూర్తయినవి: ${completedLessons}/${totalLessons} పాఠాలు`}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isEn 
                ? "Basics & Properties of Rational Numbers" 
                : (continueLesson?.title_te || "అకరణీయ సంఖ్యల ప్రాథమిక భావనలు & ధర్మాలు")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              {isEn 
                ? "Chapter: 1. Rational Numbers (అకరణీయ సంఖ్యలు)" 
                : `అధ్యాయం: ${continueLesson?.chapter_title_te || "1. అకరణీయ సంఖ్యలు"}`}
            </p>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">{isEn ? "Overall Progress" : "మొత్తం పురోగతి"}</span>
                <span className="text-orange-600">{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-linear-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPct, 8)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (continueLesson?.id) setSelectedLessonId(continueLesson.id);
                setCurrentPage('lesson');
              }}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <span>{isEn ? "Start Lesson" : "పాఠం ప్రారంభించండి"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage('chapters')}
              className="px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-2xl font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              {isEn ? "All Chapters (Syllabus)" : "అన్ని పాఠాలు (Chapters)"}
            </button>
          </div>
        </div>

        {/* Daily Target & Offline Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isEn ? "Daily Target" : "నేటి లక్ష్యం (Daily Target)"}
              </span>
              <Target className="w-4 h-4 text-orange-500" />
            </div>

            <div className="text-center py-3">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-orange-500 bg-orange-50 text-orange-700 font-black text-2xl mb-2">
                1 / 2
              </div>
              <p className="text-xs font-bold text-slate-800">
                {isEn ? "1 Lesson Completed" : "1 పాఠం పూర్తయింది"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isEn ? "Finish 1 more lesson to complete today's goal!" : "మరో 1 పాఠం చదివితే నేటి లక్ష్యం పూర్తవుతుంది!"}
              </p>
            </div>
          </div>

          {/* Quick Offline Status Button */}
          <div 
            onClick={() => setCurrentPage('offline-hub')}
            className="mt-4 p-3 bg-slate-50 hover:bg-orange-50/50 rounded-2xl border border-slate-200 hover:border-orange-200 transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-600" />
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {isEn ? "Offline Downloads" : "ఆఫ్‌లైన్ డౌన్‌లోడ్లు"}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isEn ? "Learn without internet" : "నెట్ లేకుండా చదువుకోండి"}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

      </div>

      {/* AI Tutor Callout Banner */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-block bg-orange-500/20 text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 border border-orange-500/30">
              {isEn ? "Personal AI Math Tutor" : "వ్యక్తిగత AI గురువు"}
            </div>
            <h3 className="text-lg sm:text-xl font-bold">
              {isEn ? "Have a doubt in Mathematics?" : "గణితంలో ఏదైనా సందేహం ఉందా?"}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isEn 
                ? "Type, speak using microphone, or snap a photo of any textbook problem!" 
                : "తెలుగులో టైప్ చేయండి, మాట్లాడండి లేదా లెక్కల ఫోటో తీసి అడగండి!"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('ai-tutor')}
          className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg transition-all cursor-pointer shrink-0 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isEn ? "Talk to AI Tutor" : "AI గురువుతో మాట్లాడండి"}</span>
        </button>
      </div>

      {/* Recent Quizzes & Chapters Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Quiz Scores */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              {isEn ? "Recent Quiz Scores" : "ఇటీవలి క్విజ్ ఫలితాలు"}
            </h3>
            <button
              onClick={() => setCurrentPage('progress')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              {isEn ? "Full Report" : "పూర్తి నివేదిక"}
            </button>
          </div>

          {recentQuizzes.length > 0 ? (
            <div className="space-y-3">
              {recentQuizzes.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{q.title_te}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{q.completed_at}</div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      q.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {q.score}/{q.total_questions} ({q.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              {isEn ? "No quizzes taken yet. Read a lesson and test your knowledge!" : "ఇంకా ఏ పరీక్ష రాయలేదు. పాఠం చదివి క్విజ్ రాయండి!"}
            </div>
          )}
        </div>

        {/* Quick Chapter Access Grid */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              {isEn ? "Key Chapters" : "ముఖ్య అధ్యాయాలు"}
            </h3>
            <button
              onClick={() => setCurrentPage('chapters')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              {isEn ? "View All (6)" : "అన్నీ చూడండి (6)"}
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { num: 1, title_en: "Rational Numbers", title_te: "అకరణీయ సంఖ్యలు", slug: "rational-numbers", lessons: "1 lesson", done: true },
              { num: 2, title_en: "Linear Equations in One Variable", title_te: "ఒక చరరాశిలో రేఖీయ సమీకరణాలు", slug: "linear-equations", lessons: "1 lesson", done: false },
              { num: 3, title_en: "Understanding Quadrilaterals", title_te: "చతుర్భుజాల అవగాహన", slug: "understanding-quadrilaterals", lessons: "1 lesson", done: false }
            ].map((c) => (
              <div
                key={c.num}
                onClick={() => {
                  setSelectedChapterSlug(c.slug);
                  setCurrentPage('chapters');
                }}
                className="p-3 bg-slate-50 hover:bg-orange-50/60 rounded-2xl border border-slate-200 hover:border-orange-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                    {c.num}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {isEn ? c.title_en : c.title_te}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isEn ? c.title_te : c.lessons}
                    </div>
                  </div>
                </div>
                {c.done ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
