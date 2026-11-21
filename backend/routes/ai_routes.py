import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from backend.models import db, User, AIChatHistory
from backend.ai_service import ai_service
from backend.ocr_service import ocr_service
from backend.config import Config

ai_bp = Blueprint("ai", __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@ai_bp.route("/api/ai/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    user_id = data.get("user_id")
    context_topic = data.get("context_topic", "")
    session_id = data.get("session_id", "default_session")
    msg_type = data.get("message_type", "text")  # 'text' or 'voice'

    if not message:
        return jsonify({"error": "ప్రశ్న ఖాళీగా ఉండకూడదు (Message cannot be empty)"}), 400

    # Ensure user exists or fallback to raju
    if not user_id:
        u = User.query.filter_by(username="raju").first()
        user_id = u.id if u else 1

    # Log user message
    user_log = AIChatHistory(
        user_id=user_id,
        session_id=session_id,
        role="user",
        message_text=message,
        message_type=msg_type
    )
    db.session.add(user_log)

    # Generate response
    ai_result = ai_service.generate_response(message, context_topic=context_topic)

    # Log assistant message
    asst_log = AIChatHistory(
        user_id=user_id,
        session_id=session_id,
        role="assistant",
        message_text=ai_result["text"],
        message_type="text"
    )
    db.session.add(asst_log)
    db.session.commit()

    return jsonify({
        "success": True,
        "reply": ai_result["text"],
        "provider": ai_result.get("provider", "Smart AI"),
        "is_mock": ai_result.get("is_mock", True)
    })

@ai_bp.route("/api/ai/upload-question", methods=["POST"])
def upload_question():
    """
    Accepts textbook question photo or handwritten note, extracts text with OCR,
    and returns step-by-step Telugu explanation.
    """
    user_id = request.form.get("user_id")
    context_topic = request.form.get("context_topic", "")
    session_id = request.form.get("session_id", "photo_session")

    if not user_id:
        u = User.query.filter_by(username="raju").first()
        user_id = u.id if u else 1

    if 'image' not in request.files:
        return jsonify({"error": "ఫోటో అప్‌లోడ్ చేయలేదు (No image uploaded)"}), 400

    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "దయచేసి సరైన ఫోటో ఫైల్ (PNG/JPG) ఎంచుకోండి"}), 400

    # Save image
    upload_dir = Config.UPLOAD_FOLDER
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    saved_path = os.path.join(upload_dir, unique_name)
    file.save(saved_path)

    # Run OCR extraction
    extracted_text = ocr_service.extract_text(saved_path)

    # Log user message with media
    user_log = AIChatHistory(
        user_id=user_id,
        session_id=session_id,
        role="user",
        message_text=f"[ఫోటో ప్రశ్న]: {extracted_text}",
        media_url=f"/uploads/{unique_name}",
        message_type="image"
    )
    db.session.add(user_log)

    # Ask AI
    prompt = f"విద్యార్థి పాఠ్యపుస్తకం ఫోటో నుండి తీసిన గణిత సమస్య: {extracted_text}. దీనిని 8వ తరగతి విద్యార్థికి అర్థమయ్యేలా దశలవారీగా సాధించి వివరించండి."
    ai_result = ai_service.generate_response(prompt, context_topic=context_topic)

    asst_log = AIChatHistory(
        user_id=user_id,
        session_id=session_id,
        role="assistant",
        message_text=ai_result["text"],
        message_type="text"
    )
    db.session.add(asst_log)
    db.session.commit()

    return jsonify({
        "success": True,
        "extracted_text": extracted_text,
        "image_url": f"/uploads/{unique_name}",
        "reply": ai_result["text"],
        "provider": ai_result.get("provider", "Smart AI")
    })

@ai_bp.route("/api/ai/history", methods=["GET"])
def get_history():
    user_id = request.args.get("user_id", type=int)
    session_id = request.args.get("session_id")

    if not user_id:
        u = User.query.filter_by(username="raju").first()
        user_id = u.id if u else 1

    query = AIChatHistory.query.filter_by(user_id=user_id)
    if session_id:
        query = query.filter_by(session_id=session_id)

    logs = query.order_by(AIChatHistory.created_at.asc()).limit(50).all()
    return jsonify({
        "history": [log.to_dict() for log in logs]
    })

@ai_bp.route("/api/ai/quick-prompts", methods=["GET"])
def get_quick_prompts():
    return jsonify({
        "prompts": [
            {"label": "భిన్నాలు అంటే ఏమిటి?", "text": "భిన్నాలు అంటే ఏమిటి? నిత్య జీవిత ఉదాహరణతో వివరించండి."},
            {"label": "2x + 5 = 15 సాధన", "text": "2x + 5 = 15 సమీకరణాన్ని పక్షాంతరం ద్వారా ఎలా సాధించాలి?"},
            {"label": "√144 వర్గమూలం", "text": "144 యొక్క వర్గమూలం కారణాంకాల పద్ధతిలో ఎలా కనుగొనాలి?"},
            {"label": "అకరణీయ సంఖ్యల ధర్మాలు", "text": "అకరణీయ సంఖ్యల సంకలన మరియు గుణకార తత్సమాలు ఏమిటి?"},
            {"label": "చతుర్భుజం కోణాలు", "text": "చతుర్భుజంలో నాలుగు కోణాల మొత్తం ఎంత? ఎందుకు?"},
            {"label": "నాకు ఒక లెక్క ఇవ్వండి", "text": "8వ తరగతి అకరణీయ సంఖ్యలలో నాకు సాధించడానికి ఒక ప్రాక్టీస్ లెక్క ఇవ్వండి."}
        ]
    })
