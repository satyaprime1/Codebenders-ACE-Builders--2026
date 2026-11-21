import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Award, CheckCircle, XCircle, ArrowRight, RotateCcw, 
  HelpCircle, AlertTriangle, Sparkles, Filter, Check, Loader2, ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';

export default function QuizPage({ quizId = 1, setCurrentPage }) {
  const { user, updatePoints } = useAuth();
  const { isOnline, refreshPendingCount } = useOffline();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [quizData, setQuizData] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
    setEvaluationResult(null);
    setAnswers({});
  }, [quizId, selectedDifficulty]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.getQuiz(quizId, selectedDifficulty);
      if (res.quiz) {
        setQuizData(res.quiz);
      }
    } catch (e) {
      console.warn('Failed to load quiz online:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionVal) => {
    if (evaluationResult) return;
    setAnswers(prev => ({ ...prev, [qId]: optionVal }));
  };

  const handleSubmitQuiz = async () => {
    if (evaluationResult || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await api.submitQuiz(quizId, user?.id, answers);
      if (res.success) {
        setEvaluationResult(res);
        if (res.new_total_points) updatePoints(res.new_total_points);

        if (res.passed) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.error(err);
      await offlineStorage.queueSyncAction('quiz_attempt', {
        quiz_id: quizId,
        answers: answers
      });
      refreshPendingCount();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">
          {isEn ? "Loading quiz..." : "క్విజ్ లోడ్ అవుతోంది..."}
        </p>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 text-sm">
          {isEn ? "No questions available for this chapter." : "ఈ అధ్యాయానికి ప్రశ్నలు అందుబాటులో లేవు."}
        </p>
        <button
          onClick={() => setCurrentPage('chapters')}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          {isEn ? "Back to Chapters" : "అన్ని అధ్యాయాలకు వెళ్ళండి"}
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = quizData.questions.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-16 space-y-6">
      
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('chapters')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEn ? "Back to Chapters" : "అధ్యాయాల జాబితా"}</span>
        </button>

        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
          {isEn ? `Chapter: ${quizData.chapter_title_te}` : `అధ్యాయం: ${quizData.chapter_title_te}`}
        </span>
      </div>

      {/* Title Card */}
      <div className="bg-linear-to-r from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="inline-block bg-white/20 text-white text-[11px] font-bold px-3 py-0.5 rounded-full mb-1">
              {isEn ? "Adaptive Assessment Module" : "సామర్థ్య పరీక్ష (Smart Assessment)"}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">{quizData.title_te}</h1>
            <p className="text-xs text-orange-100 mt-1">
              {isEn 
                ? `Passing Criteria: ${quizData.pass_percentage}% • Instant Feedback & Mistake Diagnosis` 
                : `ఉత్తీర్ణత శాతము: ${quizData.pass_percentage}% • నెగటివ్ మార్కులు లేవు`}
            </p>
          </div>
          <Award className="w-12 h-12 text-white/40 shrink-0" />
        </div>
      </div>

      {/* Difficulty Filter Tabs */}
      {!evaluationResult && (
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 ml-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{isEn ? "Difficulty Level:" : "స్థాయి (Difficulty):"}</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: '', label: isEn ? 'All' : 'అన్నీ' },
              { id: 'easy', label: isEn ? 'Easy' : 'సులభం' },
              { id: 'medium', label: isEn ? 'Medium' : 'మధ్యస్థం' },
              { id: 'hard', label: isEn ? 'Hard' : 'కఠినం' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDifficulty(d.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDifficulty === d.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Results Banner */}
      {evaluationResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-orange-200 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                evaluationResult.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {evaluationResult.passed ? '🎉' : '📚'}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {evaluationResult.passed 
                    ? (isEn ? "Congratulations! You Passed!" : "అభినందనలు! ఉత్తీర్ణులయ్యారు!") 
                    : (isEn ? "Good Effort! Keep Practicing" : "మంచి ప్రయత్నం!")}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn ? "Score:" : "స్కోరు:"} <strong>{evaluationResult.score} / {evaluationResult.total_questions}</strong> ({evaluationResult.percentage}%)
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-center">
              <div className="text-[10px] text-amber-700 font-bold uppercase">
                {isEn ? "Points Earned" : "పాయింట్లు లభించాయి"}
              </div>
              <div className="text-lg font-black text-amber-900">+{evaluationResult.points_earned} ⭐</div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-orange-950">
                {isEn ? "AI Tutor Recommendation:" : "AI గురువు మార్గదర్శకత్వం:"}
              </h4>
              <p className="text-xs text-orange-900 mt-1 leading-relaxed">
                {evaluationResult.recommendation_te}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setEvaluationResult(null);
                setAnswers({});
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEn ? "Retake Quiz" : "మళ్ళీ రాయండి"}</span>
            </button>

            <button
              onClick={() => setCurrentPage('ai-tutor')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? "Ask AI Tutor" : "AI గురువుని సందేహం అడగండి"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {quizData.questions.map((q, idx) => {
          const selectedAnswer = answers[q.id];
          const isEvaluated = !!evaluationResult;
          const evaluationItem = evaluationResult?.evaluations?.find(e => e.question_id === q.id);
          const mistakeItem = evaluationResult?.mistakes?.find(m => m.question_id === q.id);

          return (
            <div
              key={q.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs ${
                isEvaluated
                  ? evaluationItem?.is_correct
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.question_text_te}
                  </p>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                  {q.difficulty}
                </span>
              </div>

              {/* MCQ Options */}
              {q.question_type === 'mcq' && q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrectAnswer = isEvaluated && evaluationItem?.correct_answer === opt;
                    const isWrongSelected = isEvaluated && isSelected && !evaluationItem?.is_correct;

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt)}
                        disabled={isEvaluated}
                        className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isCorrectAnswer
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold'
                            : isWrongSelected
                            ? 'bg-rose-100 border-rose-500 text-rose-900 font-bold'
                            : isSelected
                            ? 'bg-orange-50 border-orange-500 text-orange-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-orange-50/50 hover:border-orange-200'
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isWrongSelected && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill in the blank Input */}
              {q.question_type === 'fill_blank' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={selectedAnswer || ''}
                    onChange={(e) => handleSelectOption(q.id, e.target.value)}
                    disabled={isEvaluated}
                    placeholder={isEn ? "Type your answer here..." : "మీ సమాధానాన్ని ఇక్కడ రాయండి..."}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                  />
                  {isEvaluated && (
                    <div className="mt-2 text-xs font-bold text-slate-700">
                      {isEn ? "Correct Answer:" : "సరైన జవాబు:"} <span className="text-emerald-700">{evaluationItem?.correct_answer}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mistake Diagnosis Explainer Banner */}
              {isEvaluated && !evaluationItem?.is_correct && mistakeItem && (
                <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isEn ? "Conceptual Mistake Diagnosis:" : "పొరపాటు విశ్లేషణ (Mistake Diagnosis):"}</span>
                  </div>
                  <p className="text-rose-900 leading-relaxed pl-5">
                    {mistakeItem.diagnosis_te}
                  </p>
                </div>
              )}

              {/* General Explanation */}
              {isEvaluated && evaluationItem?.is_correct && (
                <div className="mt-3 text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                  ✓ <strong>{isEn ? "Explanation:" : "వివరణ:"}</strong> {evaluationItem.explanation_te}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Submit Button Bar */}
      {!evaluationResult && (
        <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-600">
            {isEn ? "Answered:" : "పూర్తయినవి:"} <strong className="text-orange-600">{answeredCount}</strong> / {totalCount}
          </div>

          <button
            onClick={handleSubmitQuiz}
            disabled={answeredCount === 0 || isSubmitting}
            className="flex items-center gap-1.5 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEn ? "Evaluating..." : "మూల్యాంకనం జరుగుతోంది..."}</span>
              </>
            ) : (
              <>
                <span>{isEn ? "Submit Quiz" : "పరీక్షను సమర్పించండి"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
