import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from backend.models import db, User, LessonProgress, QuizAttempt, StudentProfile, OfflineSyncQueue

sync_bp = Blueprint("sync", __name__)

@sync_bp.route("/api/sync/offline", methods=["POST"])
def sync_offline():
    """
    Receives an array of offline events performed while disconnected and persists them.
    """
    data = request.get_json() or {}
    user_id = data.get("user_id")
    events = data.get("events", [])  # list of {type: 'lesson_complete'|'quiz_attempt', payload: {...}}

    if not user_id:
        return jsonify({"error": "వినియోగదారు ID తప్పనిసరి"}), 400

    synced_count = 0
    total_points_earned = 0

    for event in events:
        etype = event.get("type")
        payload = event.get("payload", {})

        # Log to OfflineSyncQueue
        q_item = OfflineSyncQueue(
            user_id=user_id,
            action_type=etype or "unknown",
            payload_json=json.dumps(payload, ensure_ascii=False),
            synced=True
        )
        db.session.add(q_item)

        if etype == "lesson_complete":
            lesson_id = payload.get("lesson_id")
            time_spent = payload.get("time_spent_seconds", 300)
            if lesson_id:
                prog = LessonProgress.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
                if not prog:
                    prog = LessonProgress(
                        user_id=user_id,
                        lesson_id=lesson_id,
                        is_completed=True,
                        time_spent_seconds=time_spent,
                        completed_at=datetime.utcnow(),
                        offline_synced=True
                    )
                    db.session.add(prog)
                else:
                    prog.is_completed = True
                    prog.time_spent_seconds += time_spent
                    prog.offline_synced = True

                total_points_earned += 25
                synced_count += 1

        elif etype == "quiz_attempt":
            quiz_id = payload.get("quiz_id")
            chapter_id = payload.get("chapter_id", 1)
            score = payload.get("score", 0)
            total_q = payload.get("total_questions", 5)
            pct = payload.get("percentage", 0.0)
            passed = payload.get("passed", False)
            mistakes = payload.get("mistakes", [])

            attempt = QuizAttempt(
                user_id=user_id,
                quiz_id=quiz_id,
                chapter_id=chapter_id,
                score=score,
                total_questions=total_q,
                percentage=pct,
                passed=passed,
                mistakes_json=json.dumps(mistakes, ensure_ascii=False),
                completed_at=datetime.utcnow(),
                offline_synced=True
            )
            db.session.add(attempt)
            total_points_earned += (score * 10) + (20 if passed else 5)
            synced_count += 1

    # Update student points
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    if profile:
        profile.total_points += total_points_earned
        profile.last_active = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "success": True,
        "synced_count": synced_count,
        "points_earned": total_points_earned,
        "new_total_points": profile.total_points if profile else 0,
        "message": f"{synced_count} ఆఫ్‌లైన్ అంశాలు విజయవంతంగా సర్వర్‌తో సింక్ అయ్యాయి!"
    })

@sync_bp.route("/api/offline/bundle", methods=["GET"])
def get_offline_bundle():
    """
    Returns full downloadable bundle of Class 8 chapters, lessons, and quizzes
    for 100% offline usage in IndexedDB.
    """
    from backend.syllabus_data import SYLLABUS_DATA
    return jsonify({
        "version": "1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "bundle": SYLLABUS_DATA
    })
