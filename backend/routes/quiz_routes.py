import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from backend.models import db, User, Quiz, Question, QuizAttempt, StudentProfile

quiz_bp = Blueprint("quiz", __name__)

@quiz_bp.route("/api/quizzes/<int:quiz_id>", methods=["GET"])
def get_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "క్విజ్ కనుగొనబడలేదు"}), 404

    difficulty = request.args.get("difficulty")
    query = Question.query.filter_by(quiz_id=quiz.id)
    if difficulty:
        query = query.filter_by(difficulty=difficulty)

    questions = query.all()
    q_list = []
    for q in questions:
        q_dict = q.to_dict()
        # For student test, do not reveal the answer directly until submission
        del q_dict["correct_answer"]
        del q_dict["explanation_te"]
        del q_dict["mistake_diagnosis"]
        q_list.append(q_dict)

    return jsonify({
        "quiz": {
            "id": quiz.id,
            "chapter_id": quiz.chapter_id,
            "chapter_title_te": quiz.chapter.title_te,
            "title_te": quiz.title_te,
            "pass_percentage": quiz.pass_percentage,
            "total_questions": len(q_list),
            "questions": q_list
        }
    })

@quiz_bp.route("/api/quizzes/<int:quiz_id>/submit", methods=["POST"])
def submit_quiz(quiz_id):
    """
    Evaluates quiz, diagnoses misconceptions/mistakes in Telugu,
    and returns personalized recommendations.
    """
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "క్విజ్ కనుగొనబడలేదు"}), 404

    data = request.get_json() or {}
    user_id = data.get("user_id")
    answers = data.get("answers", {})  # map of question_id -> student's answer

    if not user_id:
        return jsonify({"error": "వినియోగదారు ID తప్పనిసరి"}), 400

    questions = Question.query.filter_by(quiz_id=quiz.id).all()
    total_q = len(questions)
    correct_count = 0
    mistakes = []
    question_evaluations = []

    for q in questions:
        student_ans = str(answers.get(str(q.id), "")).strip()
        correct_ans = str(q.correct_answer).strip()

        is_correct = False
        # Match case-insensitively or exact match
        if student_ans.lower() == correct_ans.lower():
            is_correct = True
            correct_count += 1
        else:
            # Diagnose mistake
            diag_map = json.loads(q.mistake_diagnosis_json) if q.mistake_diagnosis_json else {}
            diagnosis_msg = diag_map.get(student_ans, "")
            if not diagnosis_msg:
                diagnosis_msg = f"సరైన విధానం: {q.explanation_te}"

            mistake_item = {
                "question_id": q.id,
                "question_text_te": q.question_text_te,
                "given_answer": student_ans or "సమాధానం ఇవ్వలేదు",
                "correct_answer": correct_ans,
                "explanation_te": q.explanation_te,
                "diagnosis_te": diagnosis_msg
            }
            mistakes.append(mistake_item)

        question_evaluations.append({
            "question_id": q.id,
            "question_text_te": q.question_text_te,
            "given_answer": student_ans,
            "correct_answer": correct_ans,
            "is_correct": is_correct,
            "explanation_te": q.explanation_te
        })

    pct = round((correct_count / total_q) * 100, 1) if total_q > 0 else 0
    passed = pct >= quiz.pass_percentage

    # Save attempt
    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz.id,
        chapter_id=quiz.chapter_id,
        score=correct_count,
        total_questions=total_q,
        percentage=pct,
        passed=passed,
        mistakes_json=json.dumps(mistakes, ensure_ascii=False),
        completed_at=datetime.utcnow(),
        offline_synced=True
    )
    db.session.add(attempt)

    # Award points to student profile
    points_earned = (correct_count * 10) + (20 if passed else 5)
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    if profile:
        profile.total_points += points_earned
        profile.last_active = datetime.utcnow()

    db.session.commit()

    # Generate personalized recommendations
    if pct >= 80:
        recommendation_te = "అద్భుతం! మీరు ఈ అధ్యాయంలోని ప్రాథమిక భావనలను సంపూర్ణంగా అర్థం చేసుకున్నారు. తదుపరి అధ్యాయానికి వెళ్లవచ్చు!"
    elif pct >= 60:
        recommendation_te = "మంచి ప్రయత్నం! ప్రాథమిక అంశాలు అర్థమయ్యాయి, కానీ కొన్ని సూక్ష్మ ధర్మాలు మరియు పక్షాంతరం నియమాలను పునశ్చరణ చేయండి."
    else:
        recommendation_te = "ఈ అధ్యాయంలో మరింత అభ్యాసం అవసరం. AI గురువు సహాయంతో సూచనలు చదివి మరోసారి పరీక్షను ప్రయత్నించండి."

    return jsonify({
        "success": True,
        "score": correct_count,
        "total_questions": total_q,
        "percentage": pct,
        "passed": passed,
        "points_earned": points_earned,
        "new_total_points": profile.total_points if profile else 0,
        "recommendation_te": recommendation_te,
        "mistakes": mistakes,
        "evaluations": question_evaluations
    })
