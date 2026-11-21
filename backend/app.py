import os
from pathlib import Path
from flask import Flask, send_from_directory, jsonify, make_response
from flask_cors import CORS
from backend.config import Config
from backend.database import init_db
from backend.routes.auth_routes import auth_bp
from backend.routes.student_routes import student_bp
from backend.routes.quiz_routes import quiz_bp
from backend.routes.ai_routes import ai_bp
from backend.routes.parent_routes import parent_bp
from backend.routes.teacher_routes import teacher_bp
from backend.routes.sync_routes import sync_bp

def create_app():
    app = Flask(__name__, static_folder=str(Config.FRONTEND_DIST), static_url_path="")
    app.config.from_object(Config)

    # Enable CORS for frontend development
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Ensure uploads folder exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(parent_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(sync_bp)

    # Health check
    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "healthy",
            "app_name": "The Last-Mile Tutor (ది లాస్ట్-మైల్ ట్యూటర్)",
            "version": "1.0.0",
            "language": "en/te supported",
            "ai_mode": "Mock/Groq/Gemini Active"
        })

    # Serve uploaded images
    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    # Serve Frontend SPA build
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_spa(path):
        dist_dir = Config.FRONTEND_DIST

        # Check if the requested file exists in dist
        if dist_dir.exists() and path and (dist_dir / path).is_file():
            return send_from_directory(dist_dir, path)

        # Critical: If it is an asset or api call that does not exist, return 404 (NEVER return index.html as a script!)
        if path.startswith("assets/") or path.startswith("api/"):
            return jsonify({"error": f"Asset '{path}' not found"}), 404

        # Serve index.html with no-cache headers to ensure client always gets current asset references
        if dist_dir.exists() and (dist_dir / "index.html").exists():
            resp = make_response(send_from_directory(dist_dir, "index.html"))
            resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            resp.headers["Pragma"] = "no-cache"
            resp.headers["Expires"] = "0"
            return resp

        return jsonify({
            "message": "The Last-Mile Tutor Flask API is running! Start the frontend with 'npm run dev' or build with 'npm run build'.",
            "api_health": "/api/health",
            "docs": "/api/chapters"
        })

    # Initialize and seed database
    init_db(app)

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
