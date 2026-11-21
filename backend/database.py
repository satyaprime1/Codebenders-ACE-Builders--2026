# -*- coding: utf-8 -*-
import json
from datetime import datetime, timedelta
from backend.models import (
    db, User, StudentProfile, Chapter, Lesson, Quiz, Question, 
    QuizAttempt, LessonProgress, TeacherAssignment
)
from backend.syllabus_data import SYLLABUS_DATA

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
        seed_data()

def seed_data():
    # Check if already seeded
    if User.query.filter_by(username="raju").first():
        return

    print("[Database] Seeding initial users and Class 8 Telugu curriculum...")

    # 1. Create Student User
    student_user = User(
        username="raju",
        full_name="రాజు వర్మ (Raju)",
        role="student",
        grade=8,
        phone="9876543210",
        school_name="జిల్లా పరిషత్ ఉన్నత పాఠశాల (ZPHS, చేవెళ్ల)",
        language_pref="te"
    )
    db.session.add(student_user)
    db.session.flush()

    student_profile = StudentProfile(
        user_id=student_user.id,
        current_grade=8,
        current_subject="Mathematics",
        streak_days=4,
        daily_target_minutes=30,
        daily_target_lessons=2,
        today_completed_lessons=1,
        total_points=240,
        last_active=datetime.utcnow()
    )
    db.session.add(student_profile)

    # 2. Create Parent User (Linked to Raju)
    parent_user = User(
        username="lakshmi",
        full_name="లక్ష్మి దేవి (Lakshmi - Parent)",
        role="parent",
        grade=8,
        phone="9876543210",
        linked_student_id=student_user.id,
        school_name="రక్షకుడు / తల్లిదండ్రులు",
        language_pref="te"
    )
    db.session.add(parent_user)

    # 3. Create Teacher / Volunteer User
    teacher_user = User(
        username="ramesh_sir",
        full_name="రమేష్ బాబు (Ramesh Sir - ZPHS Maths Teacher)",
        role="teacher",
        grade=8,
        phone="9848022338",
        school_name="జిల్లా పరిషత్ ఉన్నత పాఠశాల (ZPHS, చేవెళ్ల)",
        language_pref="te"
    )
    db.session.add(teacher_user)
    db.session.flush()

    # 4. Insert Chapters, Lessons, and Quizzes from Syllabus
    first_lesson_id = None
    first_quiz_id = None
    first_chapter_id = None

    for ch_data in SYLLABUS_DATA:
        chapter = Chapter(
            chapter_num=ch_data["chapter_num"],
            slug=ch_data["slug"],
            title_te=ch_data["title_te"],
            title_en=ch_data["title_en"],
            grade=ch_data["grade"],
            subject=ch_data["subject"],
            description_te=ch_data["description_te"],
            icon_name=ch_data["icon_name"],
            total_lessons=len(ch_data["lessons"])
        )
        db.session.add(chapter)
        db.session.flush()

        if first_chapter_id is None:
            first_chapter_id = chapter.id

        # Add Lessons
        for l_data in ch_data["lessons"]:
            lesson = Lesson(
                chapter_id=chapter.id,
                lesson_order=l_data["lesson_order"],
                slug=l_data["slug"],
                title_te=l_data["title_te"],
                title_en=l_data["title_en"],
                intro_te=l_data["intro_te"],
                objectives_json=json.dumps(l_data["objectives"], ensure_ascii=False),
                concept_explanation_te=l_data["concept_explanation_te"],
                real_life_example_te=l_data["real_life_example_te"],
                solved_problems_json=json.dumps(l_data["solved_problems"], ensure_ascii=False),
                practice_questions_json=json.dumps(l_data["practice_questions"], ensure_ascii=False),
                audio_summary_te=l_data.get("audio_summary_te", "")
            )
            db.session.add(lesson)
            db.session.flush()
            if first_lesson_id is None:
                first_lesson_id = lesson.id

        # Add Quiz
        q_data = ch_data.get("quiz")
        if q_data:
            quiz = Quiz(
                chapter_id=chapter.id,
                title_te=q_data["title_te"],
                pass_percentage=q_data.get("pass_percentage", 60)
            )
            db.session.add(quiz)
            db.session.flush()

            if first_quiz_id is None:
                first_quiz_id = quiz.id

            for item in q_data["questions"]:
                question = Question(
                    quiz_id=quiz.id,
                    question_text_te=item["question_text_te"],
                    question_type=item.get("question_type", "mcq"),
                    options_json=json.dumps(item.get("options", []), ensure_ascii=False),
                    correct_answer=item["correct_answer"],
                    explanation_te=item["explanation_te"],
                    mistake_diagnosis_json=json.dumps(item.get("mistake_diagnosis", {}), ensure_ascii=False),
                    difficulty=item.get("difficulty", "medium")
                )
                db.session.add(question)

    # 5. Seed some initial progress for Raju so dashboards are lively
    if first_lesson_id:
        progress = LessonProgress(
            user_id=student_user.id,
            lesson_id=first_lesson_id,
            is_completed=True,
            time_spent_seconds=780,
            completed_at=datetime.utcnow() - timedelta(hours=2),
            offline_synced=True
        )
        db.session.add(progress)

    if first_quiz_id and first_chapter_id:
        attempt = QuizAttempt(
            user_id=student_user.id,
            quiz_id=first_quiz_id,
            chapter_id=first_chapter_id,
            score=4,
            total_questions=5,
            percentage=80.0,
            passed=True,
            mistakes_json=json.dumps([
                {
                    "question_text_te": "-5/6 యొక్క సంకలన విలోమం ఎంత?",
                    "given_answer": "-6/5",
                    "correct_answer": "5/6",
                    "diagnosis_te": "గుణకార విలోమం మరియు సంకలన విలోమాల మధ్య గందరగోళం చెందారు. సంకలన విలోమంలో కేవలం గుర్తు మాత్రమే మారుతుంది."
                }
            ], ensure_ascii=False),
            completed_at=datetime.utcnow() - timedelta(hours=1),
            offline_synced=True
        )
        db.session.add(attempt)

    # 6. Seed a Teacher Assignment
    assignment = TeacherAssignment(
        teacher_id=teacher_user.id,
        grade=8,
        chapter_id=first_chapter_id,
        title_te="అకరణీయ సంఖ్యలు - అభ్యాసం 1.1 సమస్యలు సాధించండి",
        instructions_te="విద్యార్థులు మొదట పాఠం చదవండి, తర్వాత క్విజ్ రాయండి. ఏమైనా సందేహాలుంటే AI గురువుని అడగండి.",
        due_date=(datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d")
    )
    db.session.add(assignment)

    db.session.commit()
    print("[Database] Database successfully initialized and seeded!")
