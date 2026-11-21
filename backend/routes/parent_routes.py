from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from backend.models import db, User, StudentProfile, LessonProgress, QuizAttempt, Chapter, Lesson

parent_bp = Blueprint("parent", __name__)

@parent_bp.route("/api/parent/overview", methods=["GET"])
def get_parent_overview():
    parent_id = request.args.get("parent_id", type=int)

    # Find parent
    parent = None
    if parent_id:
        parent = User.query.get(parent_id)
    if not parent:
        parent = User.query.filter_by(username="lakshmi").first()

    # Find linked student (defaults to raju)
    student = None
    if parent and parent.linked_student_id:
        student = User.query.get(parent.linked_student_id)
    if not student:
        student = User.query.filter_by(username="raju").first()

    if not student:
        return jsonify({"error": "విద్యార్థి సమాచారం కనుగొనబడలేదు"}), 404

    profile = student.student_profile

    # Lessons completed
    total_lessons = Lesson.query.count()
    completed_progress = LessonProgress.query.filter_by(user_id=student.id, is_completed=True).all()
    completed_count = len(completed_progress)
    progress_pct = int((completed_count / total_lessons * 100)) if total_lessons > 0 else 0

    total_study_minutes = sum([p.time_spent_seconds for p in completed_progress]) // 60

    # Recent quizzes & mistakes
    attempts = QuizAttempt.query.filter_by(user_id=student.id).order_by(QuizAttempt.completed_at.desc()).limit(5).all()
    quiz_summary = []
    need_support_topics = []

    for att in attempts:
        ch = Chapter.query.get(att.chapter_id)
        quiz_summary.append({
            "chapter_title_te": ch.title_te if ch else "గణిత పరీక్ష",
            "score": att.score,
            "total_questions": att.total_questions,
            "percentage": att.percentage,
            "passed": att.passed,
            "date": att.completed_at.strftime("%d %b %Y") if att.completed_at else ""
        })

        if att.percentage < 75:
            need_support_topics.append({
                "chapter_title_te": ch.title_te if ch else "గణితం",
                "percentage": att.percentage,
                "suggestion_for_parent_te": f"మీ పిల్లవాడికి {ch.title_te if ch else 'ఈ పాఠం'} లో కొద్దిగా ప్రాక్టీస్ అవసరం. ప్రతిరోజూ 15 నిమిషాలు పాఠ్యపుస్తకం ఉదాహరణలు చేయమని ప్రోత్సహించండి."
            })

    # Home learning tips in Telugu for parents
    parent_tips = [
        "గణితం కష్టమైనది కాదు, సాధన చేస్తే సులభమవుతుంది అని మీ పిల్లలకు ధైర్యం చెప్పండి.",
        "రోజూ కనీసం 20-30 నిమిషాలు క్రమం తప్పకుండా యాప్‌లో పాఠాలు చదివేలా చూడండి.",
        "సందేహాలు వస్తే వెంటనే AI గురువులో మైక్ నొక్కి తెలుగులో అడగమని చెప్పండి.",
        "స్మార్ట్‌ఫోన్ ఇంటర్నెట్ లేకపోయినా సేవ్ చేసిన పాఠాలు చదువుకోవచ్చు."
    ]

    return jsonify({
        "parent": parent.to_dict() if parent else {},
        "student": {
            "id": student.id,
            "full_name": student.full_name,
            "grade": student.grade,
            "school_name": student.school_name,
            "streak_days": profile.streak_days if profile else 1,
            "total_points": profile.total_points if profile else 0
        },
        "metrics": {
            "completed_lessons": completed_count,
            "total_lessons": total_lessons,
            "progress_percentage": progress_pct,
            "total_study_minutes": total_study_minutes,
            "quizzes_taken": len(attempts),
            "attendance_rate": "95%"
        },
        "topics_needing_support": need_support_topics,
        "recent_quizzes": quiz_summary,
        "parent_tips": parent_tips
    })
