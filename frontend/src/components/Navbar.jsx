import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, Sparkles, Award, Wifi, WifiOff, Users, 
  RotateCcw, Compass, BarChart2, HardDrive, Settings, 
  LogOut, ChevronDown, CheckCircle, Globe
} from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage }) {
  const { user, studentProfile, role, switchUser, logout } = useAuth();
  const { isOnline, simulateOffline, toggleOfflineSimulation, pendingSyncCount, syncNow, isSyncing } = useOffline();
  const { t, lang, switchLanguage } = useLanguage();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const isEn = lang === 'en';

  const navLinks = [
    { 
      id: 'dashboard', 
      label: role === 'parent' ? t('parentReport') : role === 'teacher' ? t('teacherDesk') : t('dashboard'), 
      icon: Compass 
    },
    { id: 'chapters', label: t('lessons'), icon: BookOpen, hideFor: ['parent'] },
    { id: 'ai-tutor', label: t('aiTutor'), icon: Sparkles, badge: t('special') },
    { id: 'progress', label: t('progress'), icon: BarChart2, hideFor: ['teacher'] },
    { id: 'offline-hub', label: t('offline'), icon: HardDrive, count: pendingSyncCount },
    { id: 'settings', label: t('settings'), icon: Settings }
  ].filter(link => !link.hideFor || !link.hideFor.includes(role));

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div 
              onClick={() => setCurrentPage(role === 'parent' ? 'parent-dashboard' : role === 'teacher' ? 'teacher-dashboard' : 'dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-orange-300">
                <BookOpen className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Hexo Elite AI
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 font-medium">
                  {isEn ? "AI Regional Language Learning Platform" : "గ్రామీణ AI విద్యా దీపం"}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = currentPage === link.id || 
                  (link.id === 'dashboard' && (currentPage === 'parent-dashboard' || currentPage === 'teacher-dashboard'));
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (link.id === 'dashboard') {
                        setCurrentPage(role === 'parent' ? 'parent-dashboard' : role === 'teacher' ? 'teacher-dashboard' : 'dashboard');
                      } else {
                        setCurrentPage(link.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                      active 
                        ? 'bg-orange-50 text-orange-600 shadow-xs' 
                        : 'text-slate-600 hover:text-orange-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] bg-linear-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                        {link.badge}
                      </span>
                    )}
                    {link.count > 0 && (
                      <span className="text-[10px] bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {link.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Status Actions & Persona Switcher */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Language Switcher Pill */}
              <button
                onClick={() => switchLanguage(isEn ? 'te' : 'en')}
                className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                title={isEn ? "Switch to Telugu (తెలుగు)" : "Switch to English"}
              >
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                <span>{isEn ? "EN" : "తెలుగు"}</span>
                <span className="text-[10px] text-orange-500 underline font-normal ml-0.5">
                  ({isEn ? "తెలుగు" : "EN"})
                </span>
              </button>

              {/* Online/Offline Status Pill with Test Switch */}
              <button
                onClick={toggleOfflineSimulation}
                title={isEn ? "Click to test offline mode" : "ఆఫ్‌లైన్ మోడ్ పరీక్షించడానికి క్లిక్ చేయండి"}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="hidden xs:inline">{isEn ? "Online" : "ఆన్‌లైన్"}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isEn ? "Offline" : "ఆఫ్‌లైన్"}</span>
                  </>
                )}
              </button>

              {/* Student Points Badge */}
              {role === 'student' && studentProfile && (
                <div 
                  onClick={() => setCurrentPage('progress')}
                  className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer hover:bg-amber-100 transition-colors"
                  title={isEn ? "Your Coins / Points" : "మీ పాయింట్లు"}
                >
                  <Award className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>{studentProfile.total_points}</span>
                </div>
              )}

              {/* Persona / Role Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span className="text-sm">
                    {role === 'student' ? '🎒' : role === 'parent' ? '👩‍👧' : '👨‍🏫'}
                  </span>
                  <span className="hidden sm:inline max-w-[90px] truncate">
                    {isEn 
                      ? (role === 'student' ? 'Raju' : role === 'parent' ? 'Lakshmi' : 'Ramesh Sir')
                      : (user?.full_name?.split(' ')[0] || 'వినియోగదారు')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('switchRole')}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        switchUser('raju');
                        setShowRoleMenu(false);
                        setCurrentPage('dashboard');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50 transition-colors ${
                        role === 'student' ? 'font-bold text-orange-600 bg-orange-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎒</span>
                        <div>
                          <div>{isEn ? "Raju (Student)" : "రాజు (Raju)"}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {isEn ? "Class 8 Student" : "8వ తరగతి విద్యార్థి"}
                          </div>
                        </div>
                      </div>
                      {role === 'student' && <CheckCircle className="w-4 h-4 text-orange-600" />}
                    </button>

                    <button
                      onClick={() => {
                        switchUser('lakshmi');
                        setShowRoleMenu(false);
                        setCurrentPage('parent-dashboard');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50 transition-colors ${
                        role === 'parent' ? 'font-bold text-orange-600 bg-orange-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">👩‍👧</span>
                        <div>
                          <div>{isEn ? "Lakshmi Devi (Parent)" : "లక్ష్మి దేవి (Lakshmi)"}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {isEn ? "Parent Portal" : "తల్లిదండ్రుల పోర్టల్"}
                          </div>
                        </div>
                      </div>
                      {role === 'parent' && <CheckCircle className="w-4 h-4 text-orange-600" />}
                    </button>

                    <button
                      onClick={() => {
                        switchUser('ramesh_sir');
                        setShowRoleMenu(false);
                        setCurrentPage('teacher-dashboard');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50 transition-colors ${
                        role === 'teacher' ? 'font-bold text-orange-600 bg-orange-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">👨‍🏫</span>
                        <div>
                          <div>{isEn ? "Ramesh Sir (Teacher)" : "రమేష్ సార్ (Ramesh Sir)"}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {isEn ? "ZPHS Maths Teacher" : "ZPHS గణిత ఉపాధ్యాయుడు"}
                          </div>
                        </div>
                      </div>
                      {role === 'teacher' && <CheckCircle className="w-4 h-4 text-orange-600" />}
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        setCurrentPage('auth');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="flex items-center justify-around">
          {navLinks.slice(0, 5).map((link) => {
            const Icon = link.icon;
            const active = currentPage === link.id || 
              (link.id === 'dashboard' && (currentPage === 'parent-dashboard' || currentPage === 'teacher-dashboard'));
            return (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === 'dashboard') {
                    setCurrentPage(role === 'parent' ? 'parent-dashboard' : role === 'teacher' ? 'teacher-dashboard' : 'dashboard');
                  } else {
                    setCurrentPage(link.id);
                  }
                }}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                  active ? 'text-orange-600 font-bold' : 'text-slate-500 font-medium'
                }`}
              >
                <div className={`p-1 rounded-lg ${active ? 'bg-orange-100' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight">{link.label}</span>
                {link.count > 0 && (
                  <span className="absolute top-0 right-1 text-[9px] bg-red-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {link.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
