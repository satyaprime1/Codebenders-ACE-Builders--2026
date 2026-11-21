# -*- coding: utf-8 -*-
import os
import re
import json
import httpx
from backend.config import Config

TUTOR_SYSTEM_PROMPT = """
You are "Hexo Elite AI" Mathematics Assistant.
You teach middle school (Class 8) mathematics to students with patience, kindness, and clear step-by-step reasoning.

Rules:
1. If the student writes in English or requests English, respond in clear, simple English suited for Class 8 students.
2. If the student writes in Telugu, respond in clean, conversational Telugu.
3. Always follow this structured pedagogical format:
   - 💡 **Concept / Definition**
   - 🌾 **Real-Life Everyday Analogy**
   - 📝 **Step-by-Step Breakdown / Solution**
   - ⚠️ **Common Mistake to Watch Out For**
   - 🎯 **Check / Practice Question for the Student**
4. Give encouraging hints before revealing full answers.
5. Keep explanations warm, accessible, and free of overly dense academic jargon.
"""

class AIService:
    def __init__(self):
        self.groq_key = os.getenv("GROQ_API_KEY", Config.GROQ_API_KEY)
        self.gemini_key = os.getenv("GEMINI_API_KEY", Config.GEMINI_API_KEY)
        self.openai_key = os.getenv("OPENAI_API_KEY", Config.OPENAI_API_KEY)

    def generate_response(self, user_message, context_topic=None, grade=8):
        """
        Processes a student query and returns structured response in English or Telugu.
        Tries Groq -> Gemini -> OpenAI -> High Quality Mock AI fallback.
        """
        user_message_clean = user_message.strip()

        # Try Groq if key exists
        if self.groq_key:
            try:
                resp = self._call_groq(user_message_clean, context_topic)
                if resp:
                    return {
                        "text": resp,
                        "provider": "Groq (Llama-3.3-70B)",
                        "is_mock": False
                    }
            except Exception as e:
                print(f"[AI Service] Groq error, falling back: {e}")

        # Try Gemini if key exists
        if self.gemini_key:
            try:
                resp = self._call_gemini(user_message_clean, context_topic)
                if resp:
                    return {
                        "text": resp,
                        "provider": "Google Gemini",
                        "is_mock": False
                    }
            except Exception as e:
                print(f"[AI Service] Gemini error, falling back: {e}")

        # Use Robust Mock AI Engine
        mock_resp = self._generate_intelligent_mock_response(user_message_clean, context_topic)
        return {
            "text": mock_resp,
            "provider": "Smart Offline AI Tutor",
            "is_mock": True
        }

    def _call_groq(self, message, context_topic):
        import groq
        client = groq.Groq(api_key=self.groq_key)
        prompt = message
        if context_topic:
            prompt = f"[Topic/Language Context: {context_topic}]\nStudent question: {message}"

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": TUTOR_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=850
        )
        return completion.choices[0].message.content

    def _call_gemini(self, message, context_topic):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        prompt_text = f"{TUTOR_SYSTEM_PROMPT}\n[Topic: {context_topic or 'Mathematics'}]\nStudent question: {message}"
        payload = {
            "contents": [{
                "parts": [{"text": prompt_text}]
            }]
        }
        with httpx.Client(timeout=10.0) as client:
            res = client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        return None

    def _generate_intelligent_mock_response(self, query, context_topic=None):
        """
        Deep rule-based and NLP mathematical tutor supporting English and Telugu.
        """
        q = query.lower()
        context_str = str(context_topic or "").lower()

        # Detect language preference: English if prompt contains English keywords or context specifies English
        has_telugu = any('\u0c00' <= char <= '\u0c7f' for char in query)
        is_english = ("english" in context_str or not has_telugu)

        # 1. Linear Equation solving (e.g. 2x + 5 = 15 or 3x - 4 = 11)
        eq_match = re.search(r'(\d*)\s*([a-zA-Z])\s*([\+\-])\s*(\d+)\s*=\s*(\d+)', query)
        if eq_match:
            coeff_str, var, op, num1_str, num2_str = eq_match.groups()
            coeff = int(coeff_str) if coeff_str else 1
            num1 = int(num1_str)
            num2 = int(num2_str)
            
            if op == '+':
                rhs1 = num2 - num1
                step1_en = f"Transpose +{num1} to the right side (it changes to subtraction): {coeff}{var} = {num2} - {num1} = {rhs1}."
                step1_te = f"{num1} ను కుడివైపుకు పక్షాంతరం చేయండి: {coeff}{var} = {num2} - {num1} = {rhs1}."
            else:
                rhs1 = num2 + num1
                step1_en = f"Transpose -{num1} to the right side (it changes to addition): {coeff}{var} = {num2} + {num1} = {rhs1}."
                step1_te = f"-{num1} ను కుడివైపుకు పక్షాంతరం చేస్తే +{num1} అవుతుంది: {coeff}{var} = {num2} + {num1} = {rhs1}."

            ans = rhs1 / coeff
            ans_str = str(int(ans)) if ans.is_integer() else f"{rhs1}/{coeff}"

            if is_english:
                return f"""Hello! Let's solve the linear equation **{query.strip()}** step by step:

💡 **Concept (Linear Equation in One Variable)**:
Think of an equation like a balanced weighing scale. Whatever operation you do to one side, you must do equally to the other.

📝 **Step-by-Step Solution**:
1. Given equation: `{coeff}{var} {op} {num1} = {num2}`
2. {step1_en}
3. Since `{coeff}` is multiplying `{var}`, divide both sides by `{coeff}`:
   `{var} = {rhs1} / {coeff}`
4. Therefore: **`{var} = {ans_str}`**.

⚠️ **Common Mistake**:
Forgetting to reverse the sign when moving a number across the equals sign (+ becomes -, and - becomes +).

🎯 **Practice Question for You**:
Try solving this equation on your own: `3x - 2 = 13`.
What value of x do you get? Let me know! 😊"""
            else:
                return f"""నమస్కారం! మీరు అడిగిన సమీకరణం **{query.strip()}** ను చాలా సులభంగా సాధిద్దాం:

💡 **భావన (Concept)**:
ఇది "ఒక చరరాశిలో రేఖీయ సమీకరణం" (Linear Equation in One Variable). తక్కెడలో ఒక వైపు మార్పు చేస్తే రెండో వైపు కూడా సమానంగా మార్చాలి.

📝 **దశలవారీ సాధన (Step-by-Step Solution)**:
1. ఇవ్వబడిన సమీకరణం: `{coeff}{var} {op} {num1} = {num2}`
2. {step1_te}
3. ఇప్పుడు {coeff} అనేది {var} తో గుణిస్తున్నది కాబట్టి కుడివైపునకు వెళ్తే భాగిస్తుంది: `{var} = {rhs1} / {coeff}`.
4. కాబట్టి, **`{var} = {ans_str}`**.

⚠️ **సాధారణ పొరపాటు (Common Mistake)**:
చాలామంది విద్యార్థులు పక్షాంతరం చేసేటప్పుడు గుర్తులు మార్చడం మర్చిపోతారు.

🎯 **మీ కోసం ఒక చిన్న అభ్యాస ప్రశ్న**:
ఈ సమీకరణాన్ని సాధించండి: `3x - 2 = 13`.
x విలువ ఎంత వస్తుందో ప్రయత్నించి నాకు చెప్పండి! 😊"""

        # 2. Square Root pattern (e.g. √144, sqrt 144)
        sqrt_match = re.search(r'(?:√|sqrt|వర్గమూలం)\s*(\d+)', query, re.IGNORECASE)
        if sqrt_match:
            n = int(sqrt_match.group(1))
            root = int(n ** 0.5)
            is_perfect = (root * root == n)
            if is_perfect:
                if is_english:
                    return f"""Great question! Here is how to find **√{n}**:

💡 **Definition (Square Root)**:
The square root of a number is the value that, when multiplied by itself, gives the original number.

📝 **Step-by-Step**:
1. Prime factors or multiplication: {root} × {root} = {n}.
2. Therefore: **√{n} = {root}**.

🌾 **Everyday Example**:
If a gardener wants to plant {n} trees in a square plot with equal rows and columns, each row will have exactly **{root}** trees!

🎯 **Check Question for You**:
What is the value of **√196**? Give it a try!"""
                else:
                    return f"""భేష్! మీరు **√{n}** విలువ గురించి అడిగారు:

💡 **నిర్వచనం (Definition)**:
ఏ సంఖ్యనైతే తనతో తానే గుణించుకుంటే {n} వస్తుందో, ఆ సంఖ్యను {n} యొక్క 'వర్గమూలం' (Square Root) అంటారు.

📝 **సాధన**:
1. కారణాంకాలు: {root} × {root} = {n}.
2. కాబట్టి **√{n} = {root}**.

🎯 **మీ కోసం ప్రశ్న**:
√196 విలువ ఎంత అవుతుందో ఆలోచించి చెప్పండి!"""

        # 3. Fractions / భిన్నాలు
        if "fraction" in q or "భిన్న" in q:
            if is_english:
                return """Hello! Let's understand Fractions clearly:

💡 **Definition**:
A **Fraction** represents a part of a whole or a collection. It is written as `Numerator / Denominator`:
- **Denominator (bottom)**: Shows how many equal parts the whole is divided into.
- **Numerator (top)**: Shows how many of those equal parts are taken.

🌾 **Everyday Example**:
Imagine your mother cuts an apple into 4 equal slices and gives you 1 slice. The portion you received is represented as **1/4**!

📝 **Types of Fractions**:
1. Proper Fraction: Numerator is smaller (e.g. 2/5).
2. Improper Fraction: Numerator is larger (e.g. 7/3).
3. Mixed Fraction: A whole number and a fraction together (e.g. 1 1/2).

⚠️ **Common Mistake**:
When adding fractions with different denominators, do NOT add denominators directly! You must first find the LCM (Least Common Multiple) to make denominators equal.

🎯 **Practice Question**:
What is `3/7 + 2/7`? (Hint: The denominators are already equal)."""
            else:
                return """నమస్కారం! చాలా మంచి ప్రశ్న అడిగారు.

💡 **నిర్వచనం (Definition)**:
ఒక పూర్తి వస్తువులో నిర్దిష్ట భాగాన్ని సూచించే సంఖ్యను **భిన్నం (Fraction)** అంటారు. దీనిని `లవం / హారం` రూపంలో రాస్తాము.

🌾 **నిత్య జీవిత ఉదాహరణ**:
ఒక యాపిల్ పండును 4 సమాన భాగాలుగా కోసి 1 ముక్క తింటే, మీరు తిన్న భాగాన్ని **1/4** అంటారు!

🎯 **మీ కోసం ప్రశ్న**:
`3/7 + 2/7` ఎంత అవుతుందో కామెంట్ చేయండి!"""

        # 4. Rational Numbers / అకరణీయ సంఖ్యలు
        if "rational" in q or "అకరణీయ" in q:
            if is_english:
                return """Here is a complete guide to Rational Numbers:

💡 **Definition**:
Any number that can be expressed in the form `p/q`, where `p` and `q` are integers and `q ≠ 0` (the denominator cannot be zero), is called a **Rational Number**.
Examples: 2/3, -5/7, 4 (= 4/1), 0 (= 0/1).

🌾 **Everyday Example**:
If you share 3 liters of milk equally among 4 containers, each container holds `3/4` of a liter. Here, 3/4 is a rational number!

📝 **Key Properties**:
1. **Additive Identity**: `0` (adding 0 does not change the number: a + 0 = a).
2. **Multiplicative Identity**: `1` (multiplying by 1 preserves value: a × 1 = a).
3. **Additive Inverse**: The additive inverse of `a/b` is `-a/b`.

⚠️ **Common Mistake**:
`5/0` is NOT a rational number because division by zero is undefined in mathematics!

🎯 **Practice Question**:
What is the additive inverse of `-4/5`?"""
            else:
                return """అకరణీయ సంఖ్యల గురించి తెలుసుకుందాం:

💡 **నిర్వచనం (Definition)**:
ఏ సంఖ్యలనైతే `p/q` రూపంలో రాయగలమో, ఇక్కడ `p, q` లు పూర్ణ సంఖ్యలు మరియు `q ≠ 0`, వాటిని **అకరణీయ సంఖ్యలు (Rational Numbers)** అంటారు.

🎯 **మీ కోసం ప్రశ్న**:
`-4/5` యొక్క సంకలన విలోమం ఎంత?"""

        # 5. Quadrilaterals / Angles
        if "quadrilateral" in q or "చతుర్భుజ" in q or "angle" in q:
            if is_english:
                return """Let's explore Quadrilaterals:

💡 **Definition**:
A closed polygon bounded by four line segments with 4 angles and 4 vertices is called a **Quadrilateral**.

🔑 **Golden Rule (Angle Sum Property)**:
The sum of all four interior angles in any quadrilateral is always **360°**!
`∠A + ∠B + ∠C + ∠D = 360°`.

🌾 **Everyday Example**:
Your school blackboard, book pages, door panels, and smartphone screens are all quadrilaterals!

📝 **Types of Quadrilaterals**:
1. **Parallelogram**: Opposite sides and angles are equal.
2. **Rectangle**: Parallelogram with every angle equal to 90°.
3. **Square**: 4 equal sides and four 90° angles.
4. **Rhombus**: 4 equal sides with perpendicular diagonals.

🎯 **Practice Question**:
If three angles in a quadrilateral measure 80°, 110°, and 70°, what is the measure of the fourth angle?"""
            else:
                return """చతుర్భుజాల అధ్యాయం చాలా ఆసక్తికరంగా ఉంటుంది!

💡 **నిర్వచనం**:
నాలుగు భుజాలు కలిగిన సంవృత పటాన్ని చతుర్భుజం అంటారు. నాలుగు అంతర కోణాల మొత్తం ఎల్లప్పుడూ **360°** ఉంటుంది!

🎯 **మీ కోసం ప్రశ్న**:
మూడు కోణాలు 80°, 110°, 70° అయితే నాల్గో కోణం ఎంత?"""

        # 6. Cubes and Cube Roots
        if "cube" in q or "ఘన" in q:
            if is_english:
                return """Cubes and Cube Roots explained:

💡 **Definition**:
When a number is multiplied by itself three consecutive times, the result is its **Cube**:
`a³ = a × a × a`.
Example: `4³ = 4 × 4 × 4 = 64`.
Its inverse operation is the **Cube Root** (∛): `∛64 = 4`.

📝 **Important Perfect Cubes**:
- 1³ = 1,  2³ = 8,  3³ = 27,  4³ = 64,  5³ = 125,  10³ = 1000.

⚠️ **Common Mistake**:
`2³` is NOT `2 × 3 = 6`. It means `2 × 2 × 2 = 8`!

🎯 **Practice Question**:
What is the cube of 5 (5³)? Calculate and check!"""
            else:
                return """ఘనాలు మరియు ఘనమూలాలు:

💡 **నిర్వచనం**:
ఒక సంఖ్యను అదే సంఖ్యతో మూడు సార్లు గుణిస్తే ఘనం వస్తుంది. ఉదా: 3³ = 27. ఘనమూలం ∛27 = 3.

🎯 **మీ కోసం ప్రశ్న**:
4 యొక్క ఘనం (4³) ఎంత?"""

        # General Welcoming Fallback
        if is_english:
            return f"""Hello student! You asked: **"{query}"**.

I am your personal AI Math Tutor. You can ask me any topic from Class 8 Mathematics:
- 🔢 **Rational Numbers & Fractions**
- ⚖️ **Linear Equations in One Variable** (e.g. solve 2x + 5 = 15)
- 📐 **Understanding Quadrilaterals & Angle Sums**
- 📊 **Data Handling & Pie Charts**
- 🔲 **Squares & Square Roots** (e.g. find √144)
- 🧊 **Cubes & Cube Roots**

💡 **Tip**:
You can type directly, tap the microphone to speak, or snap a textbook photo! Which topic would you like to explore today?"""
        else:
            return f"""నమస్కారం! మీరు అడిగిన ప్రశ్న: **"{query}"**.

నేను మీ వ్యక్తిగత AI గణిత గురువుని. మీరు 8వ తరగతి గణితంలోని ఏదైనా అంశాన్ని నన్ను అడగవచ్చు:
- 🔢 అకరణీయ సంఖ్యలు & భిన్నాలు
- ⚖️ రేఖీయ సమీకరణాలు (ఉదా: 2x + 5 = 15)
- 📐 చతుర్భుజాలు & కోణాలు
- 📊 పై చార్టులు & సంభావ్యత
- 🔲 వర్గాలు & వర్గమూలాలు (ఉదా: √144)
- 🧊 ఘనాలు & ఘనమూలాలు

ఈ రోజు మనం ఏ అధ్యాయం నేర్చుకుందామా?"""

ai_service = AIService()
