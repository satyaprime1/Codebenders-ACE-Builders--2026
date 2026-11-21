import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { LanguageProvider } from './context/LanguageContext';

// Components
import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import SubjectSelectPage from './pages/SubjectSelectPage';
import ChapterListPage from './pages/ChapterListPage';
import LessonViewPage from './pages/LessonViewPage';
import AITutorPage from './pages/AITutorPage';
import QuizPage from './pages/QuizPage';
import StudentProgressPage from './pages/StudentProgressPage';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import OfflineHubPage from './pages/OfflineHubPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { user, role } = useAuth();
  
  useEffect(() => {
    document.title = "Hexo Elite AI";
  }, []);
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedLessonId, setSelectedLessonId] = useState(1);
  const [selectedChapterSlug, setSelectedChapterSlug] = useState('rational-numbers');
  const [selectedQuizId, setSelectedQuizId] = useState(1);

  // Render current view
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage setCurrentPage={setCurrentPage} />;
      case 'auth':
        return <AuthPage setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return (
          <StudentDashboard
            setCurrentPage={setCurrentPage}
            setSelectedLessonId={setSelectedLessonId}
            setSelectedChapterSlug={setSelectedChapterSlug}
          />
        );
      case 'subjects':
        return (
          <SubjectSelectPage
            setCurrentPage={setCurrentPage}
            setSelectedChapterSlug={setSelectedChapterSlug}
          />
        );
      case 'chapters':
        return (
          <ChapterListPage
            setCurrentPage={setCurrentPage}
            setSelectedLessonId={setSelectedLessonId}
            setSelectedChapterSlug={setSelectedChapterSlug}
            setSelectedQuizId={setSelectedQuizId}
          />
        );
      case 'lesson':
        return (
          <LessonViewPage
            lessonId={selectedLessonId}
            setCurrentPage={setCurrentPage}
            setSelectedLessonId={setSelectedLessonId}
            setSelectedQuizId={setSelectedQuizId}
          />
        );
      case 'ai-tutor':
        return <AITutorPage />;
      case 'quiz':
        return (
          <QuizPage
            quizId={selectedQuizId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'progress':
        return (
          <StudentProgressPage
            setCurrentPage={setCurrentPage}
            setSelectedChapterSlug={setSelectedChapterSlug}
            setSelectedQuizId={setSelectedQuizId}
          />
        );
      case 'parent-dashboard':
        return <ParentDashboard setCurrentPage={setCurrentPage} />;
      case 'teacher-dashboard':
        return <TeacherDashboard setCurrentPage={setCurrentPage} />;
      case 'offline-hub':
        return <OfflineHubPage setCurrentPage={setCurrentPage} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <LandingPage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <OfflineBanner />
      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </OfflineProvider>
    </AuthProvider>
  );
}
