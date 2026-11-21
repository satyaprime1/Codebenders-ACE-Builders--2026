import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, Award, Clock, Flame, BookOpen, AlertCircle, 
  HeartHandshake, CheckCircle2, ChevronRight, Loader2, Sparkles, Phone
} from 'lucide-react';
import { api } from '../services/api';

export default function ParentDashboard({ setCurrentPage }) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [parentData, setParentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentData();
  }, [user]);

  const loadParentData = async () => {
    try {
      setLoading(true);
      const res = await api.getParentOverview(user?.id);
      setParentData(res);
    } catch (e) {
      console.warn('Failed to load parent overview:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">
          {isEn ? "Loading parent report..." : "తల్లిదండ్రుల నివేదిక లోడ్ అవుతోంది..."}
        </p>
      </div>
    );
  }

  const student = parentData?.student || { full_name: 'Raju Varma', grade: 8 };
  const metrics = parentData?.metrics || { completed_lessons: 1, total_lessons: 6, progress_percentage: 25, total_study_minutes: 45 };
  const topicsNeedingSupport = parentData?.topics_needing_support || [];
  const parentTips = parentData?.parent_tips || [];
  const recentQuizzes = parentData?.recent_quizzes || [];

  const englishTips = [
    "Reassure your child that mathematics becomes simple and intuitive with regular step-by-step practice.",
    "Encourage at least 20-30 minutes of consistent daily study on the platform.",
    "Remind your child to tap the microphone to ask any doubt directly to the AI Tutor in Telugu or English.",
    "Saved lessons and quizzes work even without active internet connectivity."
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-linear-to-r from-teal-700 via-teal-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0 border border-white/20 shadow-inner">
              👩‍👧
            </div>
            <div>
              <div className="inline-block bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                {isEn ? "Parent & Guardian Portal" : "తల్లిదండ్రుల పోర్టల్ (Parent Dashboard)"}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold">
                {isEn ? `Learning Progress Report for Raju` : `${student.full_name} గారి అభ్యసన నివేదిక`}
              </h1>
              <p className="text-xs text-teal-100 mt-0.5">
                {isEn ? "ZPHS High School • Class 8 Mathematics" : `${student.school_name || 'జిల్లా పరిషత్ ఉన్నత పాఠశాల (ZPHS)'} • 8వ తరగతి`}
              </p>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 self-stretch sm:self-auto text-center sm:text-right">
            <div className="text-[10px] text-teal-200 font-bold uppercase">
              {isEn ? "Attendance & Consistency" : "హాజరు & యాక్టివిటీ"}
            </div>
            <div className="text-lg font-black">{metrics.attendance_rate || '95%'} {isEn ? "Consistent" : "సాధారణం"}</div>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {isEn ? "Lessons Completed" : "పూర్తయిన పాఠాలు"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.completed_lessons} / {metrics.total_lessons}
          </div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">
            {metrics.progress_percentage}% {isEn ? "completed" : "పూర్తి"}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {isEn ? "Study Time" : "చదువుకున్న సమయం"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.total_study_minutes} {isEn ? "Minutes" : "నిమిషాలు"}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            {isEn ? "Total this week" : "ఈ వారం మొత్తం"}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {isEn ? "Daily Streak" : "నిరంతర సాధన"}
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            🔥 {student.streak_days || 4} {isEn ? "Days" : "రోజులు"}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            {isEn ? "Consistent study habit" : "క్రమం తప్పకుండా చదువుతున్నారు"}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {isEn ? "Total Coins" : "మొత్తం నాణేలు"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ⭐ {student.total_points || 240}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {isEn ? "Great effort" : "చక్కని ప్రయత్నం"}
          </div>
        </div>

      </div>

      {/* Topics where child needs support */}
      <div className="bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-amber-950">
            {isEn ? "Topics Where Your Child Needs Extra Support" : "మీ పిల్లలకు ప్రత్యేక సహాయం అవసరమైన అంశాలు"}
          </h2>
        </div>
        <p className="text-xs text-amber-800">
          {isEn ? "Based on recent quiz assessments, here are areas where your child can benefit from gentle home encouragement:" : "క్విజ్ ఫలితాల ఆధారంగా, మీ పిల్లలు క్రింది పాఠాలలో కొద్దిగా వెనుకబడి ఉన్నారు:"}
        </p>

        {topicsNeedingSupport.length > 0 ? (
          <div className="space-y-3 pt-2">
            {topicsNeedingSupport.map((t, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm font-bold text-slate-900">{t.chapter_title_te}</div>
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                    {isEn ? `Score: ${t.percentage}%` : `మార్కులు: ${t.percentage}%`}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  💡 <strong>{isEn ? "Guidance for Parent:" : "తల్లిదండ్రులకు సూచన:"}</strong> {t.suggestion_for_parent_te}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold">
            {isEn 
              ? "✓ Excellent! Your child is scoring above 75% across all covered math chapters." 
              : "✓ అద్భుతం! మీ పిల్లవాడు అన్ని అధ్యాయాలలో 75% కన్నా ఎక్కువ మార్కులతో చక్కగా రాణిస్తున్నారు."}
          </div>
        )}
      </div>

      {/* Encouragement Tips for Parents */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-teal-800">
          <HeartHandshake className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">
            {isEn ? "Home Learning Guidelines for Parents" : "ఇంట్లో పిల్లల చదువు కోసం తల్లిదండ్రుల మార్గదర్శకాలు"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(isEn ? englishTips : parentTips).map((tip, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-700">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Quiz Scores */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          {isEn ? "Recent Quiz Evaluations" : "ఇటీవలి పరీక్షల మార్కులు"}
        </h3>

        <div className="divide-y divide-slate-100">
          {recentQuizzes.map((q, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-800">{q.chapter_title_te}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{q.date}</div>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full font-bold ${
                  q.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {q.score}/{q.total_questions} ({q.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
