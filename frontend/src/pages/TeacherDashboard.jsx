import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, BookOpen, Award, Plus, Calendar, CheckCircle2, 
  AlertTriangle, ArrowRight, Loader2, FileText, Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function TeacherDashboard({ setCurrentPage }) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChapterId, setNewChapterId] = useState(1);
  const [newInstructions, setNewInstructions] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadTeacherData();
  }, [user]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const res = await api.getTeacherOverview(user?.id);
      setTeacherData(res);
    } catch (e) {
      console.warn('Failed to load teacher overview:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.createAssignment({
        teacher_id: user?.id || 3,
        chapter_id: Number(newChapterId),
        title_te: newTitle,
        instructions_te: newInstructions,
        due_date: newDueDate || '2026-11-28'
      });

      if (res.success) {
        setSuccessMessage(isEn ? 'Assignment successfully assigned to students!' : 'అసైన్‌మెంట్ విజయవంతంగా కేటాయించబడింది!');
        setIsAssignModalOpen(false);
        setNewTitle('');
        setNewInstructions('');
        loadTeacherData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">
          {isEn ? "Loading teacher portal..." : "ఉపాధ్యాయ డాష్‌బోర్డ్ లోడ్ అవుతోంది..."}
        </p>
      </div>
    );
  }

  const metrics = teacherData?.metrics || { total_students: 1, class_average_score: 80.0, active_assignments: 1, struggling_students_count: 0 };
  const students = teacherData?.students || [];
  const assignments = teacherData?.assignments || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-linear-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0 border border-white/20 shadow-inner">
              👨‍🏫
            </div>
            <div>
              <div className="inline-block bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                {isEn ? "Teacher & Volunteer Portal" : "ఉపాధ్యాయుల & వాలంటీర్ల పోర్టల్ (Teacher Portal)"}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold">
                {isEn ? "Ramesh Sir (Mathematics Teacher)" : (user?.full_name || 'రమేష్ బాబు (గణిత ఉపాధ్యాయుడు)')}
              </h1>
              <p className="text-xs text-indigo-100 mt-0.5">
                {isEn ? "ZPHS High School • Class 8 Mathematics Section" : (user?.school_name || 'జిల్లా పరిషత్ ఉన్నత పాఠశాల (ZPHS, చేవెళ్ల)')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 bg-white text-indigo-800 hover:bg-indigo-50 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition-colors cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>{isEn ? "Assign Lesson / Homework" : "పాఠం / హోంవర్క్ కేటాయించండి"}</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold animate-in fade-in">
          ✓ {successMessage}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {isEn ? "Total Students" : "మొత్తం విద్యార్థులు"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.total_students} {isEn ? "Enrolled" : "మంది"}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            {isEn ? "Class 8 Mathematics" : "8వ తరగతి నమోదు"}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {isEn ? "Class Average Score" : "తరగతి సగటు మార్కులు"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.class_average_score}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {isEn ? "Good mathematical comprehension" : "గణిత సామర్థ్యాలు బాగున్నాయి"}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {isEn ? "Active Assignments" : "యాక్టివ్ అసైన్‌మెంట్లు"}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.active_assignments}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            {isEn ? "In progress by students" : "విద్యార్థులు చేస్తున్నారు"}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            {isEn ? "Need Extra Attention" : "ప్రత్యేక శ్రద్ధ అవసరమైనవారు"}
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {metrics.struggling_students_count}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            {isEn ? "Score < 65%" : "స్కోరు < 65%"}
          </div>
        </div>

      </div>

      {/* Class Student Roster Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {isEn ? "Class 8 Student Roster & Progress" : "8వ తరగతి విద్యార్థుల పురోగతి జాబితా (Class Roster)"}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">{isEn ? "Student Name" : "విద్యార్థి పేరు"}</th>
                <th className="p-3">{isEn ? "Completed Lessons" : "పూర్తయిన పాఠాలు"}</th>
                <th className="p-3">{isEn ? "Avg Quiz Score" : "సగటు క్విజ్ స్కోరు"}</th>
                <th className="p-3">{isEn ? "Daily Streak" : "నిరంతర సాధన"}</th>
                <th className="p-3">{isEn ? "Learning Status" : "అభ్యసన స్థితి"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <div className="font-bold text-slate-800">
                      {isEn ? (s.username === 'raju' ? 'Raju Varma' : s.full_name) : s.full_name}
                    </div>
                    <div className="text-[10px] text-slate-400">{s.phone || '9876543210'}</div>
                  </td>
                  <td className="p-3 font-semibold">{s.completed_lessons} {isEn ? "lessons" : "పాఠాలు"}</td>
                  <td className="p-3 font-bold text-indigo-700">{s.avg_quiz_score}%</td>
                  <td className="p-3">🔥 {s.streak_days} {isEn ? "days" : "రోజులు"}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      s.avg_quiz_score >= 70 || s.completed_lessons > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isEn ? (s.avg_quiz_score >= 70 || s.completed_lessons > 0 ? "On Track" : "Needs Support") : s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assigned Tasks / Learning Resources List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {isEn ? "Active Assignments & Learning Resources" : "కేటాయించిన అసైన్‌మెంట్లు"}
          </h3>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isEn ? "Add New Assignment" : "కొత్తది జోడించండి"}</span>
          </button>
        </div>

        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {a.chapter_title_te}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{a.title_te}</h4>
                <p className="text-xs text-slate-600 mt-1">{a.instructions_te}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] text-slate-400">{isEn ? "Due Date" : "గడువు తేదీ"}</div>
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{a.due_date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-indigo-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {isEn ? "Assign Lesson or Homework to Students" : "విద్యార్థులకు కొత్త పాఠం / అసైన్‌మెంట్ కేటాయించండి"}
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isEn ? "Select Chapter" : "అధ్యాయం ఎంచుకోండి"}
                </label>
                <select
                  value={newChapterId}
                  onChange={(e) => setNewChapterId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={1}>{isEn ? "1. Rational Numbers" : "1. అకరణీయ సంఖ్యలు"}</option>
                  <option value={2}>{isEn ? "2. Linear Equations in One Variable" : "2. ఒక చరరాశిలో రేఖీయ సమీకరణాలు"}</option>
                  <option value={3}>{isEn ? "3. Understanding Quadrilaterals" : "3. చతుర్భుజాల అవగాహన"}</option>
                  <option value={4}>{isEn ? "4. Data Handling" : "4. దత్తాంశ నిర్వహణ"}</option>
                  <option value={5}>{isEn ? "5. Squares and Square Roots" : "5. వర్గాలు మరియు వర్గమూలాలు"}</option>
                  <option value={6}>{isEn ? "6. Cubes and Cube Roots" : "6. ఘనాలు మరియు ఘనమూలాలు"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isEn ? "Assignment Title" : "అసైన్‌మెంట్ శీర్షిక"}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isEn ? "e.g. Exercise 1.2 Solved Problems" : "ఉదా: అభ్యాసం 1.2 సమస్యలు సాధించండి"}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isEn ? "Teacher Instructions / Notes" : "ఉపాధ్యాయుల సూచనలు"}
                </label>
                <textarea
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder={isEn ? "Instructions for students (e.g. Read the lesson first and solve exercise problems in notebook)..." : "విద్యార్థులకు సూచనలు రాయండి..."}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isEn ? "Due Date" : "గడువు తేదీ"}
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  {isEn ? "Cancel" : "రద్దు చేయండి"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? (isEn ? "Assigning..." : "కేటాయిస్తోంది...") : (isEn ? "Assign Homework" : "కేటాయించండి")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
