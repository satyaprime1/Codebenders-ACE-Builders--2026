import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  BarChart2, Award, Clock, Flame, BookOpen, AlertTriangle, 
  ArrowRight, CheckCircle2, ChevronRight, Loader2, Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentProgressPage({ setCurrentPage, setSelectedChapterSlug, setSelectedQuizId }) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const res = await api.getProgress(user?.id);
      setProgressData(res);
    } catch (e) {
      console.warn('Failed to fetch progress data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">
          {isEn ? "Loading progress report..." : "పురోగతి నివేదిక లోడ్ అవుతోంది..."}
        </p>
      </div>
    );
  }

  const streak = progressData?.streak_days || 4;
  const points = progressData?.total_points || 240;
  const studyMinutes = progressData?.total_study_minutes || 45;
  const chapters = progressData?.chapter_breakdown || [];
  const weakTopics = progressData?.weak_topics || [];
  const quizHistory = progressData?.quiz_history || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-1">
          <BarChart2 className="w-3.5 h-3.5" />
          <span>{isEn ? "Learning Analytics" : "అభ్యాస విశ్లేషణ (Learning Analytics)"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {isEn ? "Learning Progress & Performance Report" : "మీ అభ్యాస పురోగతి & నివేదిక"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isEn ? "Track your study time, chapter mastery, and past quiz attempts." : "మీ చదువు సమయం, అధ్యాయాల నైపుణ్యం మరియు పరీక్షల రికార్డు ఇక్కడ చూడవచ్చు."}
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-500" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              {isEn ? "Streak" : "సాధన క్రమం"}
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {streak} {isEn ? "Days" : "రోజులు"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              {isEn ? "Total Coins" : "మొత్తం నాణేలు"}
            </div>
            <div className="text-xl font-extrabold text-slate-900">{points} ⭐</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              {isEn ? "Time Studied" : "చదివిన సమయం"}
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {studyMinutes} {isEn ? "Mins" : "నిమిషాలు"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              {isEn ? "Mastered Chapters" : "పూర్తయిన అధ్యాయాలు"}
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {chapters.filter(c => c.completion_percentage === 100).length} / {chapters.length}
            </div>
          </div>
        </div>

      </div>

      {/* Weak Areas Needing Improvement Banner */}
      {weakTopics.length > 0 && (
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-amber-950">
              {isEn ? "Topics Needing Support & Practice" : "మీరు మెరుగుపడాల్సిన ముఖ్య అంశాలు"}
            </h3>
          </div>
          <p className="text-xs text-amber-800">
            {isEn ? "Focusing on these topics will boost your confidence and exam performance:" : "ఈ అంశాలపై కొద్దిగా దృష్టి సారిస్తే మీరు పరీక్షల్లో మరింత మెరుగైన ఫలితాలు సాధించవచ్చు:"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {weakTopics.map((w, idx) => (
              <div key={idx} className="bg-white/90 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900">{w.title_te}</div>
                  {w.score > 0 && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {w.score}% {isEn ? "score" : "స్కోరు"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">
                  {isEn ? `Additional practice recommended for this chapter. Use AI Tutor for hints.` : w.advice_te}
                </p>
                <button
                  onClick={() => {
                    setSelectedQuizId(w.chapter_id);
                    setCurrentPage('quiz');
                  }}
                  className="w-full text-center text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  {isEn ? "Practice Now" : "సాధన ప్రారంభించండి"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter-wise Mastery Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {isEn ? "Chapter Mastery Breakdown" : "అధ్యాయాల వారీగా అభ్యాస నైపుణ్యం (Chapter Mastery)"}
        </h2>

        <div className="space-y-4">
          {chapters.map((ch) => (
            <div key={ch.chapter_id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="text-xs font-bold text-orange-600">
                    {isEn ? `Chapter #${ch.chapter_num}: ` : `అధ్యాయం #${ch.chapter_num}: `}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {isEn ? ch.title_en : ch.title_te}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    ({isEn ? ch.title_te : ch.title_en})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 font-semibold">
                    {isEn ? `Lessons: ${ch.completed_lessons}/${ch.total_lessons}` : `పాఠాలు: ${ch.completed_lessons}/${ch.total_lessons}`}
                  </span>
                  {ch.last_quiz_score !== null && (
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                      {isEn ? `Quiz: ${ch.last_quiz_score}%` : `క్విజ్: ${ch.last_quiz_score}%`}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${ch.completion_percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Attempt History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {isEn ? "Quiz Attempt History" : "పరీక్షల చరిత్ర (Quiz History)"}
        </h2>

        {quizHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">{isEn ? "Date" : "తేదీ"}</th>
                  <th className="p-3">{isEn ? "Chapter / Quiz" : "అధ్యాయం / పరీక్ష"}</th>
                  <th className="p-3">{isEn ? "Score" : "మార్కులు"}</th>
                  <th className="p-3">{isEn ? "Percentage" : "శాతం"}</th>
                  <th className="p-3">{isEn ? "Status" : "ఫలితం"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizHistory.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-500">{q.completed_at}</td>
                    <td className="p-3 font-bold text-slate-800">{q.title_te}</td>
                    <td className="p-3 font-semibold">{q.score} / {q.total_questions}</td>
                    <td className="p-3 font-bold">{q.percentage}%</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        q.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {q.passed ? (isEn ? "Passed" : "ఉత్తీర్ణత") : (isEn ? "Retake" : "మళ్ళీ రాయాలి")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            {isEn ? "No quiz history recorded yet." : "ఇంకా ఏ పరీక్షల చరిత్ర నమోదు కాలేదు."}
          </div>
        )}
      </div>

    </div>
  );
}
