// API client for Hexo Elite AI
const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[API] Call to ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (username) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username }) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getSampleUsers: () => apiRequest('/auth/sample-users'),

  // Student & Lessons
  getChapters: (userId, grade = 8) => apiRequest(`/chapters?user_id=${userId || ''}&grade=${grade}`),
  getChapter: (slug, userId) => apiRequest(`/chapters/${slug}?user_id=${userId || ''}`),
  getLesson: (lessonId, userId) => apiRequest(`/lessons/${lessonId}?user_id=${userId || ''}`),
  completeLesson: (lessonId, userId, timeSpent = 300) => 
    apiRequest(`/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, time_spent_seconds: timeSpent })
    }),
  getDashboard: (userId) => apiRequest(`/student/dashboard?user_id=${userId || ''}`),
  getProgress: (userId) => apiRequest(`/student/progress?user_id=${userId || ''}`),

  // Quiz
  getQuiz: (quizId, difficulty) => apiRequest(`/quizzes/${quizId}${difficulty ? `?difficulty=${difficulty}` : ''}`),
  submitQuiz: (quizId, userId, answers) => 
    apiRequest(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, answers })
    }),

  // AI Tutor
  sendChatMessage: (message, userId, contextTopic = '', messageType = 'text') =>
    apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        user_id: userId,
        context_topic: contextTopic,
        message_type: messageType
      })
    }),
  getQuickPrompts: () => apiRequest('/ai/quick-prompts'),
  getChatHistory: (userId) => apiRequest(`/ai/history?user_id=${userId || ''}`),

  // Parent & Teacher
  getParentOverview: (parentId) => apiRequest(`/parent/overview?parent_id=${parentId || ''}`),
  getTeacherOverview: (teacherId) => apiRequest(`/teacher/overview?teacher_id=${teacherId || ''}`),
  createAssignment: (data) => apiRequest('/teacher/assignments', { method: 'POST', body: JSON.stringify(data) }),

  // Offline & Sync
  syncOfflineQueue: (userId, events) => 
    apiRequest('/sync/offline', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, events })
    }),
  getOfflineBundle: () => apiRequest('/offline/bundle')
};
