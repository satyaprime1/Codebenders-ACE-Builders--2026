import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, Calculator, Variable, Shapes, BarChart3, Square, Box, 
  ArrowRight, CheckCircle2, Award, Clock, Sparkles, HardDrive
} from 'lucide-react';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';

export default function ChapterListPage({ setCurrentPage, setSelectedLessonId, setSelectedChapterSlug, setSelectedQuizId }) {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    Calculator: Calculator,
    Variable: Variable,
    Shapes: Shapes,
    BarChart3: BarChart3,
    Square: Square,
    Box: Box
  };

  useEffect(() => {
    loadChapters();
  }, [user, isOnline]);

  const loadChapters = async () => {
    try {
      setLoading(true);
      if (isOnline) {
        const res = await api.getChapters(user?.id);
        if (res.chapters) {
          setChapters(res.chapters);
          await offlineStorage.saveChapters(res.chapters);
        }
      } else {
        const cached = await offlineStorage.getChapters();
        setChapters(cached);
      }
    } catch (e) {
      console.warn('Failed to load online chapters, fallback to cache:', e);
      const cached = await offlineStorage.getChapters();
      setChapters(cached);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChapter = (ch) => {
    setSelectedChapterSlug(ch.slug);
    if (ch.slug === 'rational-numbers') {
      setSelectedLessonId(1);
    } else if (ch.slug === 'linear-equations') {
      setSelectedLessonId(2);
    } else if (ch.slug === 'understanding-quadrilaterals') {
      setSelectedLessonId(3);
    } else if (ch.slug === 'data-handling') {
      setSelectedLessonId(4);
    } else if (ch.slug === 'squares-and-square-roots') {
      setSelectedLessonId(5);
    } else {
      setSelectedLessonId(6);
    }
    setCurrentPage('lesson');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isEn ? "Class 8 Mathematics (CBSE/State Board)" : "8వ తరగతి గణితం (Class 8 Mathematics)"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isEn ? "Syllabus Chapters" : "అధ్యాయాల జాబితా (Syllabus Chapters)"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isEn 
              ? "Read lesson concepts, review solved examples, and take adaptive quizzes."
              : "ప్రతి అధ్యాయాన్ని క్రమపద్ధతిలో చదివి, ఉదాహరణలు నేర్చుకుని, క్విజ్ పరీక్ష రాయండి."}
          </p>
        </div>

        {/* Offline cache all button */}
        <button
          onClick={() => setCurrentPage('offline-hub')}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors self-start sm:self-auto"
        >
          <HardDrive className="w-4 h-4 text-orange-600" />
          <span>{isEn ? "Offline Download Hub" : "ఆఫ్‌లైన్ డౌన్‌లోడ్ హబ్"}</span>
        </button>
      </div>

      {/* Chapters Grid (6 Chapters) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chapters.map((ch) => {
          const Icon = iconMap[ch.icon_name] || BookOpen;
          const isDone = ch.progress_percentage === 100;

          return (
            <div
              key={ch.id}
              className={`bg-white rounded-3xl p-6 border-2 transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                isDone 
                  ? 'border-emerald-200 bg-emerald-50/10' 
                  : 'border-slate-200 hover:border-orange-300'
              }`}
            >
              <div>
                {/* Top Badge & Chapter Num */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-sm">
                      #{ch.chapter_num}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {isDone ? (
                    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isEn ? "Completed" : "పూర్తయింది"}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">
                      {isEn ? `${ch.total_lessons} Lesson` : `${ch.total_lessons} పాఠం`}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {isEn ? ch.title_en : ch.title_te}
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  {isEn ? ch.title_te : ch.title_en}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {ch.description_te}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-500">{isEn ? "Progress" : "అభ్యాస పురోగతి"}</span>
                    <span className="text-orange-600">{ch.progress_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${ch.progress_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleStartChapter(ch)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>{isDone ? (isEn ? "Review Lesson" : "పునశ్చరణ చేయండి") : (isEn ? "Start Lesson" : "పాఠం చదవండి")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {ch.quiz_id && (
                  <button
                    onClick={() => {
                      setSelectedQuizId(ch.quiz_id);
                      setCurrentPage('quiz');
                    }}
                    className="p-2.5 bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    title={isEn ? "Take Quiz" : "సామర్థ్య పరీక్ష (Quiz) రాయండి"}
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
