# -*- coding: utf-8 -*-
import io
import sys
import unittest
from backend.app import app

class LastMileTutorTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("ది లాస్ట్-మైల్ ట్యూటర్", data["app_name"])

    def test_02_sample_users(self):
        res = self.client.get('/api/auth/sample-users')
        self.assertEqual(res.status_code, 200)
        users = res.get_json()["users"]
        usernames = [u["username"] for u in users]
        self.assertIn("raju", usernames)
        self.assertIn("lakshmi", usernames)
        self.assertIn("ramesh_sir", usernames)

    def test_03_chapters_and_lessons(self):
        res = self.client.get('/api/chapters?grade=8')
        self.assertEqual(res.status_code, 200)
        chapters = res.get_json()["chapters"]
        self.assertEqual(len(chapters), 6)
        
        # Test individual lesson
        res_lesson = self.client.get('/api/lessons/1')
        self.assertEqual(res_lesson.status_code, 200)
        lesson_data = res_lesson.get_json()["lesson"]
        self.assertIn("అకరణీయ సంఖ్యల", lesson_data["title_te"])
        self.assertTrue(len(lesson_data["solved_problems"]) > 0)
        self.assertTrue(len(lesson_data["practice_questions"]) > 0)

    def test_04_lesson_completion(self):
        res = self.client.post('/api/lessons/1/complete', json={
            "user_id": 1,
            "time_spent_seconds": 600
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["points_earned"], 25)

    def test_05_quiz_adaptive_evaluation_and_mistake_diagnosis(self):
        # 1. Fetch quiz
        res_quiz = self.client.get('/api/quizzes/1')
        self.assertEqual(res_quiz.status_code, 200)
        quiz = res_quiz.get_json()["quiz"]
        self.assertTrue(quiz["total_questions"] >= 5)

        # 2. Submit quiz with intentional wrong answer to test mistake diagnosis
        answers = {
            "1": "5/0",       # Correct
            "2": "-6/5",      # Wrong! Reciprocal instead of additive inverse
            "3": "8/15",      # Correct
            "4": "1",         # Correct
            "5": "-7/3"       # Correct
        }
        res_eval = self.client.post('/api/quizzes/1/submit', json={
            "user_id": 1,
            "answers": answers
        })
        self.assertEqual(res_eval.status_code, 200)
        result = res_eval.get_json()
        self.assertEqual(result["score"], 4)
        self.assertTrue(result["passed"])
        self.assertTrue(len(result["mistakes"]) > 0)
        # Check that diagnosis explains the mistake in Telugu
        first_mistake = result["mistakes"][0]
        self.assertIn("విలోమం", first_mistake["diagnosis_te"])

    def test_06_ai_tutor_telugu_chat(self):
        # Test concept question in Telugu
        res = self.client.post('/api/ai/chat', json={
            "message": "భిన్నాలు అంటే ఏమిటి? ఉదాహరణతో చెప్పండి",
            "user_id": 1
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("భిన్నం", data["reply"])
        self.assertIn("ఉదాహరణ", data["reply"])

        # Test linear equation solving
        res_eq = self.client.post('/api/ai/chat', json={
            "message": "2x + 5 = 15 ను ఎలా సాధించాలి?",
            "user_id": 1
        })
        self.assertEqual(res_eq.status_code, 200)
        eq_data = res_eq.get_json()
        self.assertIn("x = 5", eq_data["reply"])

    def test_07_ai_photo_upload_ocr(self):
        from PIL import Image
        img_byte_arr = io.BytesIO()
        img = Image.new('RGB', (200, 80), color=(255, 255, 255))
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        res = self.client.post('/api/ai/upload-question', data={
            'image': (img_byte_arr, 'equation_sample.png'),
            'user_id': 1
        }, content_type='multipart/form-data')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertTrue(len(data["reply"]) > 0)

    def test_08_parent_dashboard(self):
        res = self.client.get('/api/parent/overview?parent_id=2')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("student", data)
        self.assertIn("parent_tips", data)
        self.assertTrue(len(data["parent_tips"]) > 0)

    def test_09_teacher_dashboard_and_assignment(self):
        res = self.client.get('/api/teacher/overview?teacher_id=3')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(len(data["students"]) > 0)

        # Create new assignment
        res_assign = self.client.post('/api/teacher/assignments', json={
            "teacher_id": 3,
            "chapter_id": 2,
            "title_te": "రేఖీయ సమీకరణాలు - హోంవర్క్ 2.1",
            "instructions_te": "సమస్యలను సాధించి తీసుకురండి",
            "due_date": "2026-11-28"
        })
        self.assertEqual(res_assign.status_code, 200)
        self.assertTrue(res_assign.get_json()["success"])

    def test_10_offline_sync_and_bundle(self):
        # Test bundle
        res_bundle = self.client.get('/api/offline/bundle')
        self.assertEqual(res_bundle.status_code, 200)
        bundle = res_bundle.get_json()["bundle"]
        self.assertEqual(len(bundle), 6)

        # Test sync endpoint with queued actions
        events = [
            {
                "type": "lesson_complete",
                "payload": {"lesson_id": 2, "time_spent_seconds": 450}
            },
            {
                "type": "quiz_attempt",
                "payload": {
                    "quiz_id": 2,
                    "chapter_id": 2,
                    "score": 5,
                    "total_questions": 5,
                    "percentage": 100.0,
                    "passed": True
                }
            }
        ]
        res_sync = self.client.post('/api/sync/offline', json={
            "user_id": 1,
            "events": events
        })
        self.assertEqual(res_sync.status_code, 200)
        sync_data = res_sync.get_json()
        self.assertTrue(sync_data["success"])
        self.assertEqual(sync_data["synced_count"], 2)

if __name__ == '__main__':
    unittest.main()
