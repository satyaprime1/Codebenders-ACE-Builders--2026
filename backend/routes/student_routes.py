from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.models import db, User, StudentProfile, Chapter, Lesson, LessonProgress, QuizAttempt, Quiz

student_bp = Blueprint("student", __name__)

@student_bp.route("/api/chapters", methods=["GET"])
def get_chapters():
    user_id = request.args.get("user_id", type=int)
    grade = request.args.get("grade", default=8, type=int)

    chapters = Chapter.query.filter_by(grade=grade).order_by(Chapter.chapter_num).all()
    results = []

    for ch in chapters:
        ch_dict = ch.to_dict()
        total_lessons = len(ch.lessons)
        completed_lessons = 0

        if user_id:
            lesson_ids = [l.id for l in ch.lessons]
            if lesson_ids:
                completed_lessons = LessonProgress.query.filter(
                    LessonProgress.user_id == user_id,
                    LessonProgress.lesson_id.in_(lesson_ids),
                    LessonProgress.is_completed == True
                ).count()

        ch_dict["total_lessons"] = total_lessons
        ch_dict["completed_lessons"] = completed_lessons
        ch_dict["progress_percentage"] = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0
        ch_dict["quiz_id"] = ch.quiz.id if ch.quiz else None
        results.append(ch_dict)

    return jsonify({"chapters": results})

@student_bp.route("/api/chapters/<slug>", methods=["GET"])
def get_chapter_by_slug(slug):
    user_id = request.args.get("user_id", type=int)
    chapter = Chapter.query.filter_by(slug=slug).first()
    if not chapter:
        return jsonify({"error": "అధ్యాయం కనుగొనబడలేదు"}), 404

    ch_dict = chapter.to_dict()
    lessons_data = []

    for l in chapter.lessons:
        l_dict = l.to_dict()
        is_completed = False
        if user_id:
            prog = LessonProgress.query.filter_by(user_id=user_id, lesson_id=l.id).first()
            if prog and prog.is_completed:
                is_completed = True
        l_dict["is_completed"] = is_completed
        lessons_data.append(l_dict)

    ch_dict["lessons"] = lessons_data
    ch_dict["quiz_id"] = chapter.quiz.id if chapter.quiz else None
    return jsonify({"chapter": ch_dict})

@student_bp.route("/api/lessons/<int:lesson_id>", methods=["GET"])
def get_lesson(lesson_id):
    user_id = request.args.get("user_id", type=int)
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return jsonify({"error": "పాఠం కనుగొనబడలేదు"}), 404

    data = lesson.to_dict()
    data["chapter_title_te"] = lesson.chapter.title_te
    data["chapter_slug"] = lesson.chapter.slug

    # Completion status
    is_completed = False
    if user_id:
        prog = LessonProgress.query.filter_by(user_id=user_id, lesson_id=lesson.id).first()
        if prog and prog.is_completed:
            is_completed = True
    data["is_completed"] = is_completed

    # Find next lesson
    next_lesson = Lesson.query.filter(
        Lesson.chapter_id == lesson.chapter_id,
        Lesson.lesson_order > lesson.lesson_order
    ).order_by(Lesson.lesson_order).first()
    data["next_lesson_id"] = next_lesson.id if next_lesson else None

    return jsonify({"lesson": data})

@student_bp.route("/api/lessons/<int:lesson_id>/complete", methods=["POST"])
def complete_lesson(lesson_id):
    data = request.get_json() or {}
    user_id = data.get("user_id")
    time_spent = data.get("time_spent_seconds", 300)

    if not user_id:
        return jsonify({"error": "వినియోగదారు ID తప్పనిసరి"}), 400

    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return jsonify({"error": "పాఠం కనుగొనబడలేదు"}), 404

    prog = LessonProgress.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    if not prog:
        prog = LessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            is_completed=True,
            time_spent_seconds=time_spent,
            completed_at=datetime.utcnow()
        )
        db.session.add(prog)
    else:
        prog.is_completed = True
        prog.time_spent_seconds += time_spent
        prog.completed_at = datetime.utcnow()

    # Update student profile stats
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    if profile:
        profile.today_completed_lessons = min(profile.today_completed_lessons + 1, profile.daily_target_lessons)
        profile.total_points += 25
        profile.last_active = datetime.utcnow()

    db.session.commit()
    return jsonify({
        "success": True,
        "message": "అభినందనలు! పాఠం విజయవంతంగా పూర్తయింది.",
        "points_earned": 25,
        "new_total_points": profile.total_points if profile else 0
    })

@student_bp.route("/api/student/dashboard", methods=["GET"])
def get_dashboard():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        # Default to raju
        user = User.query.filter_by(username="raju").first()
        user_id = user.id if user else 1

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "వినియోగదారు కనుగొనబడలేదు"}), 404

    profile = user.student_profile
    if not profile:
        profile = StudentProfile(user_id=user.id, current_grade=8, current_subject="Mathematics")
        db.session.add(profile)
        db.session.commit()

    # Calculate overall progress
    total_lessons = Lesson.query.count()
    completed_lessons = LessonProgress.query.filter_by(user_id=user.id, is_completed=True).count()
    progress_percentage = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0

    # Find next lesson to continue
    completed_ids = [p.lesson_id for p in LessonProgress.query.filter_by(user_id=user.id, is_completed=True).all()]
    next_lesson = Lesson.query.filter(~Lesson.id.in_(completed_ids)).order_by(Lesson.chapter_id, Lesson.lesson_order).first()
    if not next_lesson:
        next_lesson = Lesson.query.first()

    # Recent quiz attempts
    recent_attempts = QuizAttempt.query.filter_by(user_id=user.id).order_by(QuizAttempt.completed_at.desc()).limit(3).all()
    recent_quizzes_data = []
    for att in recent_attempts:
        quiz = Quiz.query.get(att.quiz_id)
        recent_quizzes_data.append({
            "id": att.id,
            "title_te": quiz.title_te if quiz else "సామర్థ్య పరీక్ష",
            "score": att.score,
            "total_questions": att.total_questions,
            "percentage": att.percentage,
            "passed": att.passed,
            "completed_at": att.completed_at.strftime("%d %b, %I:%M %p") if att.completed_at else ""
        })

    return jsonify({
        "user": user.to_dict(),
        "profile": profile.to_dict(),
        "stats": {
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "progress_percentage": progress_percentage,
            "streak_days": profile.streak_days,
            "total_points": profile.total_points,
            "daily_target_lessons": profile.daily_target_lessons,
            "today_completed_lessons": profile.today_completed_lessons,
            "daily_target_minutes": profile.daily_target_minutes
        },
        "continue_lesson": {
            "id": next_lesson.id if next_lesson else None,
            "title_te": next_lesson.title_te if next_lesson else "మొదటి పాఠం ప్రారంభించండి",
            "chapter_title_te": next_lesson.chapter.title_te if next_lesson else "అకరణీయ సంఖ్యలు"
        } if next_lesson else None,
        "recent_quizzes": recent_quizzes_data
    })

@student_bp.route("/api/student/progress", methods=["GET"])
def get_detailed_progress():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        user = User.query.filter_by(username="raju").first()
        user_id = user.id if user else 1

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "వినియోగదారు కనుగొనబడలేదు"}), 404

    # Chapter-wise breakdown
    chapters = Chapter.query.filter_by(grade=8).order_by(Chapter.chapter_num).all()
    chapter_breakdown = []
    weak_topics = []

    for ch in chapters:
        l_ids = [l.id for l in ch.lessons]
        comp = LessonProgress.query.filter(
            LessonProgress.user_id == user.id,
            LessonProgress.lesson_id.in_(l_ids),
            LessonProgress.is_completed == True
        ).count()
        tot = len(l_ids)
        pct = int((comp / tot * 100)) if tot > 0 else 0

        # Quiz score for chapter
        last_quiz_att = QuizAttempt.query.filter_by(user_id=user.id, chapter_id=ch.id).order_by(QuizAttempt.completed_at.desc()).first()

        quiz_score = last_quiz_att.percentage if last_quiz_att else None
        chapter_breakdown.append({
            "chapter_id": ch.id,
            "chapter_num": ch.chapter_num,
            "title_te": ch.title_te,
            "title_en": ch.title_en,
            "completed_lessons": comp,
            "total_lessons": tot,
            "completion_percentage": pct,
            "last_quiz_score": quiz_score
        })

        if quiz_score is not None and quiz_score < 70:
            weak_topics.append({
                "chapter_id": ch.id,
                "title_te": ch.title_te,
                "score": quiz_score,
                "advice_te": f"{ch.title_te} పై మరింత అభ్యాసం అవసరం. AI గురువు సహాయంతో సమస్యలను సాధించండి."
            })
        elif comp == 0:
            weak_topics.append({
                "chapter_id": ch.id,
                "title_te": ch.title_te,
                "score": 0,
                "advice_te": "ఈ అధ్యాయం ఇంకా ప్రారంభించలేదు."
            })

    # Quiz history
    all_attempts = QuizAttempt.query.filter_by(user_id=user.id).order_by(QuizAttempt.completed_at.desc()).all()
    quiz_history = []
    for att in all_attempts:
        q = Quiz.query.get(att.quiz_id)
        quiz_history.append({
            "id": att.id,
            "quiz_id": att.quiz_id,
            "title_te": q.title_te if q else "పరీక్ష",
            "score": att.score,
            "total_questions": att.total_questions,
            "percentage": att.percentage,
            "passed": att.passed,
            "completed_at": att.completed_at.strftime("%Y-%m-%d %H:%M") if att.completed_at else "",
            "mistakes": att.to_dict()["mistakes"]
        })

    total_study_minutes = sum([p.time_spent_seconds for p in LessonProgress.query.filter_by(user_id=user.id).all()]) // 60

    return jsonify({
        "total_study_minutes": total_study_minutes,
        "streak_days": user.student_profile.streak_days if user.student_profile else 1,
        "total_points": user.student_profile.total_points if user.student_profile else 0,
        "chapter_breakdown": chapter_breakdown,
        "weak_topics": weak_topics[:3],
        "quiz_history": quiz_history
    })
