import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, CheckCircle, Sparkles, Award, ArrowRight, ArrowLeft, 
  Lightbulb, HelpCircle, Check, Eye, EyeOff, Loader2, Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import TeluguAudioPlayer from '../components/TeluguAudioPlayer';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';

export default function LessonViewPage({ lessonId = 1, setCurrentPage, setSelectedLessonId, setSelectedQuizId }) {
  const { user, updatePoints } = useAuth();
  const { isOnline, refreshPendingCount } = useOffline();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealedHints, setRevealedHints] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    loadLessonData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [lessonId, isOnline]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      if (isOnline) {
        const res = await api.getLesson(lessonId, user?.id);
        if (res.lesson) {
          setLesson(res.lesson);
          setIsCompleted(res.lesson.is_completed || false);
          await offlineStorage.saveLesson(res.lesson);
        }
      } else {
        const cached = await offlineStorage.getLesson(lessonId);
        if (cached) {
          setLesson(cached);
          setIsCompleted(cached.is_completed || false);
        }
      }
    } catch (e) {
      console.warn('Failed to load lesson online, fallback to cache:', e);
      const cached = await offlineStorage.getLesson(lessonId);
      if (cached) {
        setLesson(cached);
        setIsCompleted(cached.is_completed || false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHint = (idx) => {
    setRevealedHints(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleToggleAnswer = (idx) => {
    setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleMarkAsCompleted = async () => {
    if (isCompleted || isMarkingComplete) return;

    try {
      setIsMarkingComplete(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (isOnline) {
        const res = await api.completeLesson(lessonId, user?.id, timeSpent);
        if (res.success) {
          setIsCompleted(true);
          if (res.new_total_points) updatePoints(res.new_total_points);
        }
      } else {
        await offlineStorage.queueSyncAction('lesson_complete', {
          lesson_id: lessonId,
          time_spent_seconds: timeSpent
        });
        setIsCompleted(true);
        refreshPendingCount();
      }
    } catch (err) {
      console.error(err);
      await offlineStorage.queueSyncAction('lesson_complete', {
        lesson_id: lessonId,
        time_spent_seconds: timeSpent
      });
      setIsCompleted(true);
      refreshPendingCount();
    } finally {
      setIsMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">
          {isEn ? "Loading lesson..." : "పాఠం లోడ్ అవుతోంది..."}
        </p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 text-sm">
          {isEn ? "Lesson details could not be found." : "పాఠం వివరాలు లభించలేదు."}
        </p>
        <button
          onClick={() => setCurrentPage('chapters')}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
        >
          {isEn ? "Back to Chapters" : "అన్ని అధ్యాయాలకు వెళ్ళండి"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-16 space-y-6">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setCurrentPage('chapters')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEn ? "Back to Chapters" : "అధ్యాయాల జాబితా"}</span>
        </button>

        <span className="text-xs font-semibold text-slate-400">
          {isEn ? `Chapter: ${lesson.chapter_title_te}` : `అధ్యాయం: ${lesson.chapter_title_te}`}
        </span>
      </div>

      {/* Lesson Hero Header */}
      <div className="bg-linear-to-r from-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs mb-2">
              {isEn ? `Lesson #${lesson.lesson_order} • Class 8 Mathematics` : `పాఠం #${lesson.lesson_order} • 8వ తరగతి గణితం`}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isEn ? lesson.title_en : lesson.title_te}
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 mt-1 font-medium">
              {isEn ? lesson.title_te : lesson.title_en}
            </p>
          </div>

          {/* Audio Speaker Widget */}
          <div className="self-start sm:self-auto shrink-0">
            <TeluguAudioPlayer 
              text={`${lesson.title_te}. ${lesson.intro_te}. ${lesson.concept_explanation_te}`}
              label={isEn ? "Listen (Audio)" : "పాఠం వినండి (Audio)"}
            />
          </div>
        </div>

        {/* Intro */}
        <p className="mt-4 text-xs sm:text-sm text-orange-50 leading-relaxed bg-black/15 p-4 rounded-2xl border border-white/10">
          {lesson.intro_te}
        </p>
      </div>

      {/* 1. Learning Objectives */}
      {lesson.objectives && lesson.objectives.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>
              {isEn 
                ? "Learning Objectives (Key Concepts):" 
                : "ఈ పాఠంలో మీరు నేర్చుకునే అంశాలు (Learning Objectives):"}
            </span>
          </h2>
          <ul className="space-y-2">
            {lesson.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. Concept Explanation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-600" />
            <span>{isEn ? "Concept Explanation" : "భావన వివరణ (Concept Explanation)"}</span>
          </h2>
        </div>

        <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
          {lesson.concept_explanation_te}
        </div>
      </div>

      {/* 3. Real Life Everyday Example */}
      <div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🌾</span>
          <h3 className="text-base font-bold text-emerald-950">
            {isEn ? "Everyday Life Example" : "నిత్య జీవిత ఉదాహరణ (Daily Life Example)"}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
          {lesson.real_life_example_te}
        </p>
      </div>

      {/* 4. Solved Problems Step-by-Step */}
      {lesson.solved_problems && lesson.solved_problems.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-orange-600" />
            <span>{isEn ? "Solved Step-by-Step Problems" : "సాధించిన సమస్యలు (Solved Problems)"}</span>
          </h2>

          <div className="space-y-4">
            {lesson.solved_problems.map((prob, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-start gap-2">
                  <span className="bg-orange-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
                    {isEn ? `Problem #${idx + 1}` : `సమస్య #${idx + 1}`}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {prob.problem_te}
                  </h4>
                </div>

                <div className="pl-2 border-l-2 border-orange-400 space-y-1.5 mt-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isEn ? "Step-by-Step Solution:" : "దశలవారీ సాధన:"}
                  </div>
                  {prob.steps_te && prob.steps_te.map((step, sIdx) => (
                    <div key={sIdx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  {isEn ? `Correct Answer: ${prob.answer_te}` : `సరైన జవాబు: ${prob.answer_te}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Practice Questions with Interactive Hints */}
      {lesson.practice_questions && lesson.practice_questions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{isEn ? "Practice Questions for You" : "మీ కోసం అభ్యాస ప్రశ్నలు (Practice Questions)"}</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              {isEn ? "Try solving on your own using hints" : "సూచనలను ఉపయోగించి స్వయంగా సాధించండి"}
            </span>
          </div>

          <div className="space-y-4">
            {lesson.practice_questions.map((pq, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-start gap-2">
                  <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
                    {isEn ? `Question #${idx + 1}` : `ప్రశ్న #${idx + 1}`}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {pq.question_te}
                  </p>
                </div>

                {/* Hint Toggle */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleToggleHint(idx)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>
                      {revealedHints[idx] 
                        ? (isEn ? "Hide Hint" : "సూచనను దాచండి") 
                        : (isEn ? "Show Hint" : "సూచన చూడండి")}
                    </span>
                  </button>

                  <button
                    onClick={() => handleToggleAnswer(idx)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                  >
                    {revealedAnswers[idx] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>
                      {revealedAnswers[idx] 
                        ? (isEn ? "Hide Answer" : "జవాబు దాచండి") 
                        : (isEn ? "Check Answer" : "జవాబు సరిచూసుకోండి")}
                    </span>
                  </button>
                </div>

                {revealedHints[idx] && (
                  <div className="p-3 bg-amber-100/50 border border-amber-200 rounded-xl text-xs text-amber-900 animate-in fade-in duration-150">
                    <strong>💡 {isEn ? "Hint:" : "సూచన:"}</strong> {pq.hint_te}
                  </div>
                )}

                {revealedAnswers[idx] && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 animate-in fade-in duration-150">
                    ✓ {isEn ? `Correct Answer: ${pq.answer_te}` : `సరైన జవాబు: ${pq.answer_te}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ask AI Tutor Banner Deep-link */}
      <div className="bg-linear-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {isEn ? "Have a doubt in this lesson?" : "ఈ పాఠంలో సందేహం ఉందా?"}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {isEn 
                ? "Ask the AI Tutor to explain with step-by-step guidance!" 
                : "AI గురువుని అడిగితే మరిన్ని ఉదాహరణలతో సులభంగా వివరిస్తారు!"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('ai-tutor')}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          {isEn ? "Ask AI Tutor" : "AI గురువుని అడగండి"}
        </button>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          
          {/* Mark Complete Button */}
          <button
            onClick={handleMarkAsCompleted}
            disabled={isCompleted || isMarkingComplete}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer ${
              isCompleted 
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {isCompleted 
                ? (isEn ? "Lesson Completed (+25 ⭐)" : "పాఠం పూర్తయింది (+25 ⭐)") 
                : (isEn ? "Mark Lesson Completed" : "పాఠం పూర్తయిందిగా గుర్తించండి")}
            </span>
          </button>

          {/* Take Quiz */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedQuizId(lesson.chapter_id);
                setCurrentPage('quiz');
              }}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>{isEn ? "Take Quiz" : "పరీక్ష (Quiz) రాయండి"}</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
