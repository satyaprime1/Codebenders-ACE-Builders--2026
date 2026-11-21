import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lastmile_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      username: 'raju',
      full_name: 'రాజు వర్మ (Raju)',
      role: 'student',
      grade: 8,
      school_name: 'జిల్లా పరిషత్ ఉన్నత పాఠశాల (ZPHS, చేవెళ్ల)',
      language_pref: 'te'
    };
  });

  const [studentProfile, setStudentProfile] = useState(() => {
    const saved = localStorage.getItem('lastmile_profile');
    return saved ? JSON.parse(saved) : {
      current_grade: 8,
      current_subject: 'Mathematics',
      streak_days: 4,
      daily_target_minutes: 25,
      daily_target_lessons: 2,
      today_completed_lessons: 1,
      total_points: 240
    };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lastmile_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lastmile_user');
    }
  }, [user]);

  useEffect(() => {
    if (studentProfile) {
      localStorage.setItem('lastmile_profile', JSON.stringify(studentProfile));
    }
  }, [studentProfile]);

  const switchUser = async (username) => {
    setLoading(true);
    try {
      const res = await api.login(username);
      if (res.user) {
        setUser(res.user);
        if (res.student_profile) {
          setStudentProfile(res.student_profile);
        }
      }
    } catch (e) {
      console.error('Failed to switch user:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username) => {
    setLoading(true);
    try {
      const res = await api.login(username);
      if (res.user) {
        setUser(res.user);
        if (res.student_profile) {
          setStudentProfile(res.student_profile);
        }
        return res;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setStudentProfile(null);
    localStorage.removeItem('lastmile_user');
    localStorage.removeItem('lastmile_profile');
  };

  const updatePoints = (newPoints) => {
    setStudentProfile((prev) => prev ? { ...prev, total_points: newPoints } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user,
      studentProfile,
      role: user?.role || 'student',
      loading,
      login,
      logout,
      switchUser,
      updatePoints,
      setStudentProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
