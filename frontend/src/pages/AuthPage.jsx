import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, User, Phone, School, ArrowRight, Sparkles, Check, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function AuthPage({ setCurrentPage }) {
  const { login, switchUser } = useAuth();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student');
  const [grade, setGrade] = useState(8);
  const [schoolName, setSchoolName] = useState('జిల్లా పరిషత్ ఉన్నత పాఠశాల (ZPHS)');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const samplePersonas = [
    {
      username: 'raju',
      name: isEn ? 'Raju Varma (Student)' : 'రాజు వర్మ (Raju)',
      role: 'student',
      badge: isEn ? 'Class 8 Student' : 'విద్యార్థి (Class 8)',
      icon: '🎒',
      desc: isEn ? 'Interactive math lessons, AI Tutor, adaptive quizzes' : 'గణిత పాఠాలు నేర్చుకోవడం, AI గురువు సహాయం'
    },
    {
      username: 'lakshmi',
      name: isEn ? 'Lakshmi Devi (Parent)' : 'లక్ష్మి దేవి (Lakshmi)',
      role: 'parent',
      badge: isEn ? 'Parent Portal' : 'తల్లిదండ్రులు (Parent)',
      icon: '👩‍👧',
      desc: isEn ? 'Child progress tracking, home guidance tips' : 'పిల్లల చదువు పురోగతి, తెలుగు గైడెన్స్'
    },
    {
      username: 'ramesh_sir',
      name: isEn ? 'Ramesh Sir (Teacher)' : 'రమేష్ బాబు (Ramesh Sir)',
      role: 'teacher',
      badge: isEn ? 'ZPHS Maths Teacher' : 'ఉపాధ్యాయుడు (Teacher)',
      icon: '👨‍🏫',
      desc: isEn ? 'Class roster analytics, assign homework' : 'తరగతి నివేదికలు, అసైన్‌మెంట్లు కేటాయించడం'
    }
  ];

  const handleSelectPersona = async (p) => {
    try {
      setIsSubmitting(true);
      await switchUser(p.username);
      if (p.role === 'parent') setCurrentPage('parent-dashboard');
      else if (p.role === 'teacher') setCurrentPage('teacher-dashboard');
      else setCurrentPage('dashboard');
    } catch (e) {
      setErrorMessage(isEn ? 'Failed to login with persona.' : 'ప్రవేశించడంలో సమస్య ఏర్పడింది.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!username || !fullName) {
          setErrorMessage(isEn ? 'Username and Full Name are required.' : 'వినియోగదారు పేరు మరియు పూర్తి పేరు తప్పనిసరి.');
          setIsSubmitting(false);
          return;
        }

        const res = await api.register({
          username,
          full_name: fullName,
          role,
          grade,
          phone,
          school_name: schoolName
        });

        if (res.success) {
          await switchUser(username);
          if (role === 'parent') setCurrentPage('parent-dashboard');
          else if (role === 'teacher') setCurrentPage('teacher-dashboard');
          else setCurrentPage('dashboard');
        }
      } else {
        if (!username) {
          setErrorMessage(isEn ? 'Please enter your username.' : 'దయచేసి వినియోగదారు పేరు లేదా ఫోన్ నంబర్ నమోదు చేయండి.');
          setIsSubmitting(false);
          return;
        }

        const res = await login(username);
        if (res && res.user) {
          if (res.user.role === 'parent') setCurrentPage('parent-dashboard');
          else if (res.user.role === 'teacher') setCurrentPage('teacher-dashboard');
          else setCurrentPage('dashboard');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || (isEn ? 'Login failed. Please verify credentials.' : 'లాగిన్ విఫలమైంది.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-linear-to-br from-orange-500 to-amber-500 items-center justify-center text-white shadow-md mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Hexo Elite AI
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isRegister 
              ? (isEn ? "Create your educational profile" : "కొత్త ఖాతా సృష్టించండి") 
              : (isEn ? "Sign in to continue learning" : "మీ ఖాతాలోకి ప్రవేశించండి")}
          </p>
        </div>

        {/* 1-Click Fast Testing Personas */}
        <div className="mt-6 bg-orange-50/70 border border-orange-200 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 mb-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>{isEn ? "1-Click Instant Persona Sign-In:" : "ఒకే క్లిక్‌తో పరీక్షించండి (Test Accounts):"}</span>
          </div>

          <div className="space-y-2">
            {samplePersonas.map((p) => (
              <button
                key={p.username}
                onClick={() => handleSelectPersona(p)}
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-orange-100/60 border border-orange-200/80 rounded-2xl p-2.5 flex items-center justify-between text-left transition-all cursor-pointer shadow-xs hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{p.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{p.badge}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                  <span>{isEn ? "Enter" : "ప్రవేశించు"}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="mt-6 bg-white py-6 px-6 shadow-md rounded-3xl border border-slate-200 sm:px-8">
          
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
            <button
              onClick={() => { setIsRegister(false); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isRegister ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {isEn ? "Login" : "లాగిన్ (Login)"}
            </button>
            <button
              onClick={() => { setIsRegister(true); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isRegister ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {isEn ? "Register" : "రిజిస్ట్రేషన్ (Register)"}
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEn ? "Username" : "వినియోగదారు పేరు (Username)"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isRegister ? (isEn ? "e.g. suresh123" : "ఉదా: suresh123") : (isEn ? "e.g. raju" : "ఉదా: raju")}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? "Full Name" : "పూర్తి పేరు (Full Name)"}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isEn ? "Enter full name" : "మీ పూర్తి పేరు నమోదు చేయండి"}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                    required
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? "Select Role" : "మీ పాత్రను ఎంచుకోండి (Role)"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'student', label: isEn ? 'Student' : 'విద్యార్థి', icon: '🎒' },
                      { id: 'parent', label: isEn ? 'Parent' : 'తల్లిదండ్రులు', icon: '👩‍👧' },
                      { id: 'teacher', label: isEn ? 'Teacher' : 'ఉపాధ్యాయుడు', icon: '👨‍🏫' }
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          role === r.id
                            ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-base">{r.icon}</div>
                        <div className="text-[11px] mt-0.5">{r.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grade */}
                {role === 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isEn ? "Class (Grade)" : "తరగతి (Class)"}
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                      <option value={8}>{isEn ? "Class 8 (Active)" : "8వ తరగతి (Class 8 - యాక్టివ్)"}</option>
                      <option value={9}>{isEn ? "Class 9" : "9వ తరగతి (Class 9)"}</option>
                      <option value={10}>{isEn ? "Class 10" : "10వ తరగతి (Class 10)"}</option>
                    </select>
                  </div>
                )}

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isEn ? "Phone Number (Optional)" : "ఫోన్ నంబర్ (ఐచ్ఛికం)"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isRegister ? (isEn ? "Create Account" : "ఖాతా సృష్టించండి") : (isEn ? "Sign In" : "ప్రవేశించండి")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy Footnote */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {isEn 
                ? "Protected in accordance with minor digital privacy principles. Minimum data is collected."
                : "మైనర్ల డేటా రక్షణ నియమాల ప్రకారం కనీస వివరాలు మాత్రమే సేకరించబడతాయి."}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
