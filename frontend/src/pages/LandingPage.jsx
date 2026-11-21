import React from 'react';
import { 
  BookOpen, Sparkles, WifiOff, Mic, Camera, Award, 
  ArrowRight, CheckCircle2, ShieldCheck, HeartHandshake, Compass, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage({ setCurrentPage }) {
  const { switchUser } = useAuth();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const handleQuickStart = (username, page) => {
    switchUser(username);
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 bg-linear-to-b from-orange-50 via-white to-slate-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-100/80 border border-orange-200 text-orange-800 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-6 shadow-xs">
              <Sparkles className="w-4 h-4 text-orange-600 animate-spin" />
              <span>
                {isEn ? "AI-Powered Regional Language Learning Platform" : "ప్రాంతీయ భాషా (తెలుగు) AI విద్యా విప్లవం"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Hexo Elite AI
              <span className="block mt-2 text-2xl sm:text-4xl bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {isEn ? "Personal AI Math Tutor for Every Student" : "ప్రతి విద్యార్థికి స్వంత AI గణిత గురువు"}
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              {isEn 
                ? "An intelligent educational platform designed for underprivileged students in regional-language schools. Works on basic smartphones, supports poor connectivity, and teaches Class 8 Mathematics with step-by-step reasoning."
                : "ఇంటర్నెట్ సరిగ్గా లేకపోయినా, సాధారణ స్మార్ట్‌ఫోన్లలో కూడా 8వ తరగతి గణితాన్ని సరళమైన తెలుగులో బోధించే తెలివైన డిజిటల్ గురువు."}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full">
              <button
                onClick={() => handleQuickStart('raju', 'dashboard')}
                className="flex items-center justify-center gap-2 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-base px-7 py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
              >
                <span>{isEn ? "Learn as Student (Raju)" : "విద్యార్థిగా నేర్చుకోండి (రాజు)"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setCurrentPage('ai-tutor')}
                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-6 py-3.5 rounded-2xl border border-slate-200 shadow-sm transition-all cursor-pointer w-full sm:w-auto"
              >
                <Sparkles className="w-5 h-5 text-orange-600" />
                <span>{isEn ? "Try AI Tutor" : "AI గురువుని పరీక్షించండి"}</span>
              </button>
            </div>

            {/* Features Checkmarks */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? "Regional & Telugu First" : "100% తెలుగు మాధ్యమం"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? "Offline Learning & PWA" : "ఆఫ్‌లైన్ అభ్యాసం"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? "Voice & Photo Questions" : "వాయిస్ & ఫోటో ప్రశ్నలు"}</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3 User Roles Cards (One-Click Testing for Evaluators) */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isEn ? "Three Dedicated User Roles" : "మూడు ముఖ్యమైన పాత్రలు (User Roles)"}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {isEn ? "Switch to any role with a single click to explore customized dashboards" : "ఒకే క్లిక్‌తో ఏ పాత్రలోకి అయినా ప్రవేశించి పనితీరును పరిశీలించవచ్చు"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Student Role Card */}
            <div 
              onClick={() => handleQuickStart('raju', 'dashboard')}
              className="bg-linear-to-b from-orange-50/50 to-white rounded-3xl p-6 border-2 border-orange-200 hover:border-orange-500 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl shadow-md mb-4 group-hover:scale-110 transition-transform">
                  🎒
                </div>
                <div className="inline-block bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2">
                  {isEn ? "Student" : "విద్యార్థి (Student)"}
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isEn ? "Raju Varma (Class 8)" : "రాజు వర్మ (8వ తరగతి)"}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {isEn 
                    ? "Interactive lessons, conversational voice & photo AI doubt-solving, adaptive practice quizzes, streak counter, and earned learning coins."
                    : "పాఠాలు చదవడం, AI గురువుతో తెలుగులో మాట్లాడి సందేహాలు తీర్చుకోవడం, ప్రాక్టీస్ ప్రశ్నలు సాధించడం మరియు పాయింట్లు సంపాదించడం."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-orange-100 flex items-center justify-between text-orange-600 font-bold text-xs">
                <span>{isEn ? "Open Student Dashboard" : "స్టూడెంట్ డాష్‌బోర్డ్ తెరవండి"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Parent Role Card */}
            <div 
              onClick={() => handleQuickStart('lakshmi', 'parent-dashboard')}
              className="bg-linear-to-b from-teal-50/50 to-white rounded-3xl p-6 border-2 border-teal-200 hover:border-teal-500 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl shadow-md mb-4 group-hover:scale-110 transition-transform">
                  👩‍👧
                </div>
                <div className="inline-block bg-teal-100 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2">
                  {isEn ? "Parent" : "తల్లిదండ్రులు (Parent)"}
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isEn ? "Lakshmi Devi (Mother)" : "లక్ష్మి దేవి (తల్లి)"}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {isEn 
                    ? "Non-technical progress overview, daily study time tracker, weak topic highlights, and practical home encouragement guidance."
                    : "పిల్లల రోజువారీ చదువు సమయం, క్విజ్ మార్కులు, బలహీనమైన అధ్యాయాలు తెలుసుకోవడం మరియు ఇంట్లో సహకరించేందుకు తెలుగు సూచనలు."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-teal-100 flex items-center justify-between text-teal-700 font-bold text-xs">
                <span>{isEn ? "Open Parent Dashboard" : "పేరెంట్ డాష్‌బోర్డ్ తెరవండి"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Teacher Role Card */}
            <div 
              onClick={() => handleQuickStart('ramesh_sir', 'teacher-dashboard')}
              className="bg-linear-to-b from-indigo-50/50 to-white rounded-3xl p-6 border-2 border-indigo-200 hover:border-indigo-500 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-md mb-4 group-hover:scale-110 transition-transform">
                  👨‍🏫
                </div>
                <div className="inline-block bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2">
                  {isEn ? "Teacher / Volunteer" : "ఉపాధ్యాయుడు / వాలంటీర్ (Teacher)"}
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isEn ? "Ramesh Sir (ZPHS Teacher)" : "రమేష్ సార్ (ZPHS ఉపాధ్యాయుడు)"}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {isEn 
                    ? "Class-wide student roster, average performance monitoring, homework assignment dispatch, and flagging students needing extra support."
                    : "మొత్తం తరగతి పనితీరు సమీక్షించడం, పాఠాలు కేటాయించడం (Assignments), వెనుకబడిన విద్యార్థులను గుర్తించడం."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-100 flex items-center justify-between text-indigo-700 font-bold text-xs">
                <span>{isEn ? "Open Teacher Dashboard" : "టీచర్ డాష్‌బోర్డ్ తెరవండి"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Problem Statement & Solutions Pillars */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isEn ? "Solutions Tailored for Rural & Regional Learners" : "గ్రామీణ విద్యార్థుల కోసం ప్రత్యేకంగా రూపొందించిన పరిష్కారాలు"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">
                {isEn ? "Regional Language AI" : "తెలుగు AI గురువు"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn 
                  ? "Explains concepts in simple regional language with everyday analogies, avoiding complex jargon."
                  : "ఆంగ్ల పదాల గందరగోళం లేకుండా విద్యార్థికి అర్థమయ్యే స్వచ్ఛమైన తెలుగులో నిత్య జీవిత ఉదాహరణలతో దశలవారీగా వివరిస్తుంది."}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">
                {isEn ? "Full Offline Support" : "పూర్తి ఆఫ్‌లైన్ సపోర్ట్"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn 
                  ? "100% offline access to downloaded lessons and quizzes. Automatically synchronizes progress when internet returns."
                  : "నెట్‌వర్క్ లేని మారుమూల గ్రామాలలో కూడా సేవ్ చేసిన పాఠాలు మరియు క్విజ్‌లు పనిచేస్తాయి. నెట్ రాగానే ప్రోగ్రెస్ సింక్ అవుతుంది."}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">
                {isEn ? "Voice-Based Questions" : "వాయిస్ ప్రశ్నలు"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn 
                  ? "Students can ask questions simply by speaking into the microphone and listen to spoken answers."
                  : "టైపింగ్ రాని చిన్నపిల్లలు కూడా మైక్రోఫోన్ నొక్కి తెలుగులో నేరుగా ప్రశ్న అడగవచ్చు మరియు సమాధానాన్ని వినవచ్చు."}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">
                {isEn ? "Photo Question Scanner" : "ఫోటో స్కానర్ పరిష్కారం"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn 
                  ? "Snap a photo of a textbook problem or handwritten note. The OCR AI extracts the problem and guides step-by-step."
                  : "పుస్తకంలోని లెక్క లేదా నోట్‌బుక్ ఫోటో తీస్తే, సమస్యను గుర్తించి హింట్లతో పాటు సాధన విధానాన్ని నేర్పిస్తుంది."}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Class 8 Mathematics Syllabus Overview */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                {isEn ? "Curriculum Overview" : "సిలబస్ పరిచయం"}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {isEn ? "Class 8 Mathematics - 6 Key Chapters" : "8వ తరగతి గణితం - 6 ముఖ్య అధ్యాయాలు"}
              </h2>
            </div>
            <button
              onClick={() => setCurrentPage('chapters')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{isEn ? "View all chapters" : "అన్ని పాఠాలు చూడండి"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { num: 1, title_en: "Rational Numbers", title_te: "అకరణీయ సంఖ్యలు" },
              { num: 2, title_en: "Linear Equations", title_te: "రేఖీయ సమీకరణాలు" },
              { num: 3, title_en: "Quadrilaterals", title_te: "చతుర్భుజాల అవగాహన" },
              { num: 4, title_en: "Data Handling", title_te: "దత్తాంశ నిర్వహణ" },
              { num: 5, title_en: "Squares & Roots", title_te: "వర్గాలు & వర్గమూలాలు" },
              { num: 6, title_en: "Cubes & Roots", title_te: "ఘనాలు & ఘనమూలాలు" }
            ].map((c) => (
              <div 
                key={c.num}
                onClick={() => setCurrentPage('chapters')}
                className="p-3.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-2xl transition-all cursor-pointer text-center"
              >
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center mx-auto mb-2">
                  {c.num}
                </div>
                <div className="text-xs font-bold text-slate-800 line-clamp-1">
                  {isEn ? c.title_en : c.title_te}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {isEn ? c.title_te : c.title_en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-slate-900 text-slate-400 text-xs text-center border-t border-slate-800">
        <p>
          {isEn 
            ? "© 2026 Hexo Elite AI • Personal AI Math Assistant for Every Regional-Language Student" 
            : "© 2026 Hexo Elite AI • ప్రతి గ్రామీణ విద్యార్థికి స్వంత AI గురువు"}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          {isEn ? "Designed in compliance with DPDP Child Digital Safety guidelines" : "గోప్యత మరియు బాలల డిజిటల్ రక్షణ మార్గదర్శకాలకు అనుగుణంగా రూపొందించబడింది"}
        </p>
      </footer>

    </div>
  );
}
