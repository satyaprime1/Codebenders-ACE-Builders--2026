from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from backend.models import db, User, StudentProfile, LessonProgress, QuizAttempt, Chapter, TeacherAssignment

teacher_bp = Blueprint("teacher", __name__)

@teacher_bp.route("/api/teacher/overview", methods=["GET"])
def get_teacher_overview():
    teacher_id = request.args.get("teacher_id", type=int)

    teacher = None
    if teacher_id:
        teacher = User.query.get(teacher_id)
    if not teacher:
        teacher = User.query.filter_by(username="ramesh_sir").first()

    # Get all students
    students = User.query.filter_by(role="student").all()
    student_roster = []
    total_score_sum = 0
    total_quiz_count = 0

    for s in students:
        comp_count = LessonProgress.query.filter_by(user_id=s.id, is_completed=True).count()
        attempts = QuizAttempt.query.filter_by(user_id=s.id).all()
        avg_score = 0
        if attempts:
            avg_score = round(sum([a.percentage for a in attempts]) / len(attempts), 1)
            total_score_sum += avg_score
            total_quiz_count += 1

        student_roster.append({
            "id": s.id,
            "full_name": s.full_name,
            "grade": s.grade,
            "phone": s.phone,
            "completed_lessons": comp_count,
            "avg_quiz_score": avg_score,
            "streak_days": s.student_profile.streak_days if s.student_profile else 0,
            "status": "చక్కగా చదువుతున్నాడు" if avg_score >= 70 or comp_count > 0 else "ప్రత్యేక శ్రద్ధ అవసరం"
        })

    # Assignments
    assignments = TeacherAssignment.query.order_by(TeacherAssignment.created_at.desc()).all()
    assignments_data = []
    for a in assignments:
        ch = Chapter.query.get(a.chapter_id)
        assignments_data.append({
            "id": a.id,
            "title_te": a.title_te,
            "chapter_title_te": ch.title_te if ch else "గణితం",
            "instructions_te": a.instructions_te,
            "due_date": a.due_date,
            "created_at": a.created_at.strftime("%d %b %Y") if a.created_at else ""
        })

    class_avg = round(total_score_sum / total_quiz_count, 1) if total_quiz_count > 0 else 78.5

    return jsonify({
        "teacher": teacher.to_dict() if teacher else {},
        "metrics": {
            "total_students": len(students),
            "class_average_score": class_avg,
            "active_assignments": len(assignments_data),
            "struggling_students_count": len([s for s in student_roster if s["avg_quiz_score"] < 65])
        },
        "students": student_roster,
        "assignments": assignments_data
    })

@teacher_bp.route("/api/teacher/assignments", methods=["POST"])
def create_assignment():
    data = request.get_json() or {}
    teacher_id = data.get("teacher_id")
    chapter_id = data.get("chapter_id", 1)
    title_te = data.get("title_te", "").strip()
    instructions_te = data.get("instructions_te", "").strip()
    due_date = data.get("due_date", (datetime.utcnow() + timedelta(days=5)).strftime("%Y-%m-%d"))

    if not title_te:
        return jsonify({"error": "అసైన్‌మెంట్ శీర్షిక తప్పనిసరి"}), 400

    if not teacher_id:
        t = User.query.filter_by(username="ramesh_sir").first()
        teacher_id = t.id if t else 1

    assignment = TeacherAssignment(
        teacher_id=teacher_id,
        grade=8,
        chapter_id=chapter_id,
        title_te=title_te,
        instructions_te=instructions_te,
        due_date=due_date
    )
    db.session.add(assignment)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "అసైన్‌మెంట్ విద్యార్థులకు విజయవంతంగా కేటాయించబడింది!",
        "assignment": assignment.to_dict()
    })
