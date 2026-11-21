from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.models import db, User, StudentProfile

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()

    if not username:
        return jsonify({"error": "దయచేసి వినియోగదారు పేరు నమోదు చేయండి (Please enter username)"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        # Check by phone
        user = User.query.filter_by(phone=username).first()

    if not user:
        return jsonify({"error": "వినియోగదారు కనుగొనబడలేదు (User not found)"}), 404

    profile = user.student_profile.to_dict() if user.student_profile else None
    return jsonify({
        "success": True,
        "user": user.to_dict(),
        "student_profile": profile
    })

@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip().lower()
    full_name = data.get("full_name", "").strip()
    role = data.get("role", "student")
    grade = int(data.get("grade", 8))
    phone = data.get("phone", "")
    school_name = data.get("school_name", "జిల్లా పరిషత్ ఉన్నత పాఠశాల (ZPHS)")

    if not username or not full_name:
        return jsonify({"error": "వినియోగదారు పేరు మరియు పూర్తి పేరు తప్పనిసరి"}), 400

    existing = User.query.filter_by(username=username).first()
    if existing:
        return jsonify({"error": "ఈ వినియోగదారు పేరు ఇప్పటికే ఉపయోగంలో ఉంది"}), 400

    user = User(
        username=username,
        full_name=full_name,
        role=role,
        grade=grade,
        phone=phone,
        school_name=school_name,
        language_pref="te"
    )
    db.session.add(user)
    db.session.flush()

    if role == "student":
        profile = StudentProfile(
            user_id=user.id,
            current_grade=grade,
            current_subject="Mathematics",
            streak_days=1,
            daily_target_minutes=25,
            daily_target_lessons=2,
            today_completed_lessons=0,
            total_points=50,
            last_active=datetime.utcnow()
        )
        db.session.add(profile)

    db.session.commit()
    return jsonify({
        "success": True,
        "user": user.to_dict(),
        "student_profile": user.student_profile.to_dict() if user.student_profile else None
    })

@auth_bp.route("/api/auth/sample-users", methods=["GET"])
def get_sample_users():
    """Returns sample personas for one-click testing of Student, Parent, and Teacher roles"""
    users = User.query.filter(User.username.in_(["raju", "lakshmi", "ramesh_sir"])).all()
    return jsonify({
        "users": [u.to_dict() for u in users]
    })
