import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, Calculator, Atom, Globe2, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export default function SubjectSelectPage({ setCurrentPage, setSelectedChapterSlug }) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [selectedClass, setSelectedClass] = useState(8);

  const subjects = [
    {
      id: 'math',
      title_en: 'Mathematics (Class 8)',
      title_te: 'గణితం (Mathematics)',
      icon: Calculator,
      color: 'from-orange-500 to-amber-500',
      active: true,
      chapters_count: 6,
      desc_en: 'Rational Numbers, Linear Equations, Understanding Quadrilaterals, Squares, Cubes, and Data Handling.',
      desc_te: 'అకరణీయ సంఖ్యలు, రేఖీయ సమీకరణాలు, చతుర్భుజాలు, వర్గాలు, ఘనాలు మరియు దత్తాంశ నిర్వహణ.'
    },
    {
      id: 'science',
      title_en: 'General Science',
      title_te: 'సాధారణ సైన్స్ (General Science)',
      icon: Atom,
      color: 'from-blue-500 to-cyan-500',
      active: false,
      chapters_count: 8,
      desc_en: 'Physics, Chemistry, and Biology concepts for middle school (Coming Soon).',
      desc_te: 'భౌతిక శాస్త్రం, రసాయన శాస్త్రం మరియు జీవ శాస్త్రం భావనలు (త్వరలో అందుబాటులోకి రానుంది).'
    },
    {
      id: 'social',
      title_en: 'Social Studies',
      title_te: 'సాంఘిక శాస్త్రం (Social Studies)',
      icon: Globe2,
      color: 'from-emerald-500 to-teal-500',
      active: false,
      chapters_count: 7,
      desc_en: 'Geography, History, and Civics concepts (Coming Soon).',
      desc_te: 'భౌగోళిక శాస్త్రం, చరిత్ర మరియు పౌరశాస్త్రం (త్వరలో అందుబాటులోకి రానుంది).'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isEn ? "Curriculum Selection" : "పాఠ్యప్రణాళిక (Curriculum Selection)"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {isEn ? "Select Class and Subject" : "తరగతి మరియు విషయం ఎంచుకోండి"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isEn ? "Select your grade to start interactive lessons and quizzes." : "మీ పాఠశాల తరగతిని ఎంచుకుని అభ్యసన అధ్యాయాలను ప్రారంభించండి."}
        </p>
      </div>

      {/* Class Selection Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700">
          {isEn ? "1. Select Class:" : "1. తరగతి ఎంపిక (Select Class):"}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: 8, status: isEn ? 'Active (Full Syllabus)' : 'యాక్టివ్ (పూర్తి సిలబస్)' },
            { num: 9, status: isEn ? 'Coming Soon' : 'త్వరలో రానుంది' },
            { num: 10, status: isEn ? 'Coming Soon' : 'త్వరలో రానుంది' }
          ].map(c => (
            <button
              key={c.num}
              onClick={() => setSelectedClass(c.num)}
              className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                selectedClass === c.num
                  ? 'border-orange-500 bg-orange-50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-2xl font-black text-slate-900">
                {isEn ? `Class ${c.num}` : `${c.num}వ తరగతి`}
              </div>
              <div className={`text-[10px] font-bold mt-1 ${c.num === 8 ? 'text-orange-600' : 'text-slate-400'}`}>
                {c.status}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Selection Cards */}
      <div className="space-y-3 pt-3">
        <h2 className="text-sm font-bold text-slate-700">
          {isEn ? "2. Select Subject:" : "2. విషయం ఎంపిక (Select Subject):"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {subjects.map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className={`bg-white rounded-3xl p-6 border-2 transition-all shadow-sm flex flex-col justify-between ${
                  s.active
                    ? 'border-orange-300 hover:border-orange-500 hover:shadow-md cursor-pointer'
                    : 'border-slate-200 opacity-60'
                }`}
                onClick={() => {
                  if (s.active) setCurrentPage('chapters');
                }}
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${s.color} text-white flex items-center justify-center mb-4 shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-slate-900">
                      {isEn ? s.title_en : s.title_te}
                    </h3>
                  </div>
                  <div className="text-[11px] font-bold text-orange-600 mb-2">
                    {s.chapters_count} {isEn ? "Chapters" : "అధ్యాయాలు"}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isEn ? s.desc_en : s.desc_te}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {s.active ? (
                    <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                      <span>{isEn ? "Start Chapters" : "పాఠాలు ప్రారంభించండి"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      {isEn ? "Coming Soon" : "త్వరలో విడుదలవుతుంది"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
