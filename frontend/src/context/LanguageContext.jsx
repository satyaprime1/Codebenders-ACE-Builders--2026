import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const TRANSLATIONS = {
  en: {
    appName: "Hexo Elite AI",
    appTagline: "AI Learning Platform for Rural Schools",
    dashboard: "Dashboard",
    lessons: "Lessons",
    aiTutor: "AI Tutor",
    quiz: "Quiz",
    progress: "Progress",
    offline: "Offline",
    settings: "Settings",
    roleStudent: "Student",
    roleParent: "Parent",
    roleTeacher: "Teacher",
    onlineStatus: "Online",
    offlineStatus: "Offline",
    continueLearning: "Continue Learning",
    dailyTarget: "Daily Learning Target",
    streakDays: "Days Streak",
    coins: "Coins / Points",
    startQuiz: "Take Quiz",
    askAI: "Ask AI Tutor",
    submit: "Submit",
    next: "Next",
    back: "Back",
    parentReport: "Parent Report",
    teacherDesk: "Teacher Portal",
    special: "Special",
    switchRole: "Switch Role",
    studentRoleDesc: "Grade 8 Student",
    parentRoleDesc: "Parent Portal",
    teacherRoleDesc: "ZPHS Maths Teacher",
    logout: "Logout / Other Account",
    allChapters: "All Chapters (Syllabus)",
    offlineNotice: "You are currently in Offline Mode. Downloaded lessons & quizzes are available.",
    syncNotice: "offline items ready to sync with server.",
    syncNow: "Sync Now"
  },
  te: {
    appName: "Hexo Elite AI",
    appTagline: "గ్రామీణ విద్యార్థుల కోసం స్వంత AI గురువు",
    dashboard: "డాష్‌బోర్డ్",
    lessons: "పాఠాలు",
    aiTutor: "AI గురువు",
    quiz: "క్విజ్",
    progress: "పురోగతి",
    offline: "ఆఫ్‌లైన్",
    settings: "సెట్టింగులు",
    roleStudent: "విద్యార్థి",
    roleParent: "తల్లిదండ్రులు",
    roleTeacher: "ఉపాధ్యాయుడు",
    onlineStatus: "ఆన్‌లైన్",
    offlineStatus: "ఆఫ్‌లైన్",
    continueLearning: "నేర్చుకోవడం కొనసాగించండి",
    dailyTarget: "నేటి అభ్యాస లక్ష్యం",
    streakDays: "రోజుల నిరంతర సాధన",
    coins: "నాణేలు / పాయింట్లు",
    startQuiz: "పరీక్ష ప్రారంభించండి",
    askAI: "AI గురువుని అడగండి",
    submit: "సమర్పించండి",
    next: "తరువాత",
    back: "వెనుకకు",
    parentReport: "తల్లిదండ్రుల నివేదిక",
    teacherDesk: "ఉపాధ్యాయ డెస్క్",
    special: "ప్రత్యేకం",
    switchRole: "పాత్ర మార్చుకోండి",
    studentRoleDesc: "8వ తరగతి విద్యార్థి",
    parentRoleDesc: "తల్లిదండ్రుల పోర్టల్",
    teacherRoleDesc: "ZPHS గణిత ఉపాధ్యాయుడు",
    logout: "లాగ్‌అవుట్ / ఇతర ఖాతా",
    allChapters: "అన్ని పాఠాలు (Chapters)",
    offlineNotice: "మీరు ప్రస్తుతం ఆఫ్‌లైన్ మోడ్ లో ఉన్నారు. డౌన్‌లోడ్ చేసిన పాఠాలు & క్విజ్‌లు పనిచేస్తాయి.",
    syncNotice: "సింక్ చేయని ఆఫ్‌లైన్ అంశాలు ఉన్నాయి.",
    syncNow: "సర్వర్‌తో సింక్ చేయండి"
  }
};

export function LanguageProvider({ children }) {
  // Default to 'en' (English) as requested
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lastmile_lang');
    // If not saved or previously defaulted to 'te', set to 'en'
    if (!saved || saved === 'te') {
      localStorage.setItem('lastmile_lang', 'en');
      return 'en';
    }
    return saved;
  });

  const switchLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lastmile_lang', newLang);
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
