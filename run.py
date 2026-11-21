#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HEXO ELITE AI
AI-Powered Regional Language Learning Platform

Run command:
    python run.py
"""

import os
import sys

# Ensure UTF-8 console output for Windows cp1252 compatibility
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
if hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import webbrowser
from pathlib import Path
from backend.app import app

def main():
    port = int(os.getenv("PORT", 5000))
    url = f"http://127.0.0.1:{port}"

    print("\n" + "=" * 65)
    print(" [HEXO ELITE AI]")
    print(" [VISION] గ్రామీణ విద్యార్థుల కోసం ప్రాంతీయ భాషా AI గణిత గురువు")
    print("=" * 65)
    print(f" [URL] వెబ్‌సైట్ అందుబాటులో ఉంది: {url}")
    print(f" [STUDENT] విద్యార్థి ఖాతా:   raju       (రాజు వర్మ - 8వ తరగతి)")
    print(f" [PARENT]  తల్లిదండ్రుల ఖాతా:  lakshmi    (లక్ష్మి దేవి)")
    print(f" [TEACHER] ఉపాధ్యాయుల ఖాతా:   ramesh_sir (రమేష్ బాబు - ZPHS ఉపాధ్యాయుడు)")
    print("=" * 65)
    print(" * AI మోడ్: స్మార్ట్ ఆఫ్‌లైన్ AI / Groq / Gemini")
    print(" * PWA & ఆఫ్‌లైన్: సర్వీస్ వర్కర్ & IndexedDB సిద్ధంగా ఉన్నాయి")
    print("=" * 65 + "\n")

    # Automatically open default browser after a brief delay
    try:
        if os.getenv("NO_BROWSER", "0") != "1":
            import threading
            threading.Timer(1.2, lambda: webbrowser.open(url)).start()
    except Exception:
        pass

    app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    main()
