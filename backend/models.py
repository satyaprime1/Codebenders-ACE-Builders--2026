from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")  # 'student', 'parent', 'teacher'
    grade = db.Column(db.Integer, default=8)
    phone = db.Column(db.String(20), nullable=True)
    linked_student_id = db.Column(db.Integer, nullable=True)  # for parents linking to a student
    school_name = db.Column(db.String(150), default="జిల్లా పరిషత్ ఉన్నత పాఠశాల (ZPHS)")
    language_pref = db.Column(db.String(10), default="te")  # 'te' (Telugu)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    student_profile = db.relationship("StudentProfile", backref="user", uselist=False, cascade="all, delete-orphan")
    lesson_progress = db.relationship("LessonProgress", backref="user", cascade="all, delete-orphan")
    quiz_attempts = db.relationship("QuizAttempt", backref="user", cascade="all, delete-orphan")
    chat_logs = db.relationship("AIChatHistory", backref="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "full_name": self.full_name,
            "role": self.role,
            "grade": self.grade,
            "phone": self.phone,
            "linked_student_id": self.linked_student_id,
            "school_name": self.school_name,
            "language_pref": self.language_pref,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class StudentProfile(db.Model):
    __tablename__ = "student_profiles"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    current_grade = db.Column(db.Integer, default=8)
    current_subject = db.Column(db.String(50), default="Mathematics")
    streak_days = db.Column(db.Integer, default=3)
    daily_target_minutes = db.Column(db.Integer, default=25)
    daily_target_lessons = db.Column(db.Integer, default=2)
    today_completed_lessons = db.Column(db.Integer, default=1)
    total_points = db.Column(db.Integer, default=150)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "current_grade": self.current_grade,
            "current_subject": self.current_subject,
            "streak_days": self.streak_days,
            "daily_target_minutes": self.daily_target_minutes,
            "daily_target_lessons": self.daily_target_lessons,
            "today_completed_lessons": self.today_completed_lessons,
            "total_points": self.total_points,
            "last_active": self.last_active.isoformat() if self.last_active else None
        }

class Chapter(db.Model):
    __tablename__ = "chapters"
    
    id = db.Column(db.Integer, primary_key=True)
    chapter_num = db.Column(db.Integer, nullable=False)
    slug = db.Column(db.String(80), unique=True, nullable=False)
    title_te = db.Column(db.String(150), nullable=False)
    title_en = db.Column(db.String(150), nullable=False)
    grade = db.Column(db.Integer, default=8)
    subject = db.Column(db.String(50), default="Mathematics")
    description_te = db.Column(db.Text, nullable=False)
    icon_name = db.Column(db.String(50), default="BookOpen")
    total_lessons = db.Column(db.Integer, default=3)
    
    lessons = db.relationship("Lesson", backref="chapter", cascade="all, delete-orphan", order_by="Lesson.lesson_order")
    quiz = db.relationship("Quiz", backref="chapter", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "chapter_num": self.chapter_num,
            "slug": self.slug,
            "title_te": self.title_te,
            "title_en": self.title_en,
            "grade": self.grade,
            "subject": self.subject,
            "description_te": self.description_te,
            "icon_name": self.icon_name,
            "total_lessons": self.total_lessons,
            "lessons_count": len(self.lessons)
        }

class Lesson(db.Model):
    __tablename__ = "lessons"
    
    id = db.Column(db.Integer, primary_key=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapters.id"), nullable=False)
    lesson_order = db.Column(db.Integer, default=1)
    slug = db.Column(db.String(100), nullable=False)
    title_te = db.Column(db.String(200), nullable=False)
    title_en = db.Column(db.String(200), nullable=False)
    intro_te = db.Column(db.Text, nullable=False)
    objectives_json = db.Column(db.Text, nullable=False)  # JSON array of strings
    concept_explanation_te = db.Column(db.Text, nullable=False)
    real_life_example_te = db.Column(db.Text, nullable=False)
    solved_problems_json = db.Column(db.Text, nullable=False)  # JSON array of {problem_te, steps_te: [], answer_te}
    practice_questions_json = db.Column(db.Text, nullable=False)  # JSON array of {question_te, hint_te, answer_te}
    audio_summary_te = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "chapter_id": self.chapter_id,
            "lesson_order": self.lesson_order,
            "slug": self.slug,
            "title_te": self.title_te,
            "title_en": self.title_en,
            "intro_te": self.intro_te,
            "objectives": json.loads(self.objectives_json) if self.objectives_json else [],
            "concept_explanation_te": self.concept_explanation_te,
            "real_life_example_te": self.real_life_example_te,
            "solved_problems": json.loads(self.solved_problems_json) if self.solved_problems_json else [],
            "practice_questions": json.loads(self.practice_questions_json) if self.practice_questions_json else [],
            "audio_summary_te": self.audio_summary_te or self.intro_te
        }

class LessonProgress(db.Model):
    __tablename__ = "lesson_progress"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    time_spent_seconds = db.Column(db.Integer, default=0)
    completed_at = db.Column(db.DateTime, nullable=True)
    offline_synced = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "lesson_id": self.lesson_id,
            "is_completed": self.is_completed,
            "time_spent_seconds": self.time_spent_seconds,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "offline_synced": self.offline_synced
        }

class Quiz(db.Model):
    __tablename__ = "quizzes"
    
    id = db.Column(db.Integer, primary_key=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapters.id"), nullable=False)
    title_te = db.Column(db.String(200), nullable=False)
    pass_percentage = db.Column(db.Integer, default=60)
    
    questions = db.relationship("Question", backref="quiz", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "chapter_id": self.chapter_id,
            "title_te": self.title_te,
            "pass_percentage": self.pass_percentage,
            "total_questions": len(self.questions)
        }

class Question(db.Model):
    __tablename__ = "questions"
    
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)
    question_text_te = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), default="mcq")  # 'mcq', 'fill_blank'
    options_json = db.Column(db.Text, nullable=True)  # JSON array for mcq
    correct_answer = db.Column(db.String(255), nullable=False)
    explanation_te = db.Column(db.Text, nullable=False)
    mistake_diagnosis_json = db.Column(db.Text, nullable=True)  # map of wrong_option -> why it's wrong in Telugu
    difficulty = db.Column(db.String(20), default="medium")  # 'easy', 'medium', 'hard'

    def to_dict(self):
        return {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "question_text_te": self.question_text_te,
            "question_type": self.question_type,
            "options": json.loads(self.options_json) if self.options_json else [],
            "correct_answer": self.correct_answer,
            "explanation_te": self.explanation_te,
            "mistake_diagnosis": json.loads(self.mistake_diagnosis_json) if self.mistake_diagnosis_json else {},
            "difficulty": self.difficulty
        }

class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)
    chapter_id = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=5)
    percentage = db.Column(db.Float, default=0.0)
    passed = db.Column(db.Boolean, default=False)
    mistakes_json = db.Column(db.Text, default="[]")  # array of {question_id, given_answer, correct_answer, diagnosis_te}
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    offline_synced = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "quiz_id": self.quiz_id,
            "chapter_id": self.chapter_id,
            "score": self.score,
            "total_questions": self.total_questions,
            "percentage": self.percentage,
            "passed": self.passed,
            "mistakes": json.loads(self.mistakes_json) if self.mistakes_json else [],
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "offline_synced": self.offline_synced
        }

class AIChatHistory(db.Model):
    __tablename__ = "ai_chat_history"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    session_id = db.Column(db.String(80), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user', 'assistant'
    message_text = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(255), nullable=True)
    message_type = db.Column(db.String(20), default="text")  # 'text', 'voice', 'image'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "role": self.role,
            "message_text": self.message_text,
            "media_url": self.media_url,
            "message_type": self.message_type,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class TeacherAssignment(db.Model):
    __tablename__ = "teacher_assignments"
    
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    grade = db.Column(db.Integer, default=8)
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapters.id"), nullable=False)
    title_te = db.Column(db.String(200), nullable=False)
    instructions_te = db.Column(db.Text, nullable=False)
    due_date = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "teacher_id": self.teacher_id,
            "grade": self.grade,
            "chapter_id": self.chapter_id,
            "title_te": self.title_te,
            "instructions_te": self.instructions_te,
            "due_date": self.due_date,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class OfflineSyncQueue(db.Model):
    __tablename__ = "offline_sync_queue"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)
    payload_json = db.Column(db.Text, nullable=False)
    synced = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
