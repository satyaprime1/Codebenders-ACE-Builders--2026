// IndexedDB and LocalStorage offline manager for Hexo Elite AI
const DB_NAME = 'lastmile_tutor_db';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Offline chapters and lessons store
        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chapters')) {
          db.createObjectStore('chapters', { keyPath: 'slug' });
        }
        // Offline action sync queue
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('synced', 'synced', { unique: false });
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
  return dbPromise;
}

export const offlineStorage = {
  async saveChapters(chapters) {
    try {
      const db = await getDB();
      const tx = db.transaction('chapters', 'readwrite');
      const store = tx.objectStore('chapters');
      chapters.forEach((ch) => store.put(ch));
      return new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
      });
    } catch (e) {
      console.warn('Failed to save chapters to IndexedDB, fallback to localStorage', e);
      localStorage.setItem('offline_chapters', JSON.stringify(chapters));
    }
  },

  async getChapters() {
    try {
      const db = await getDB();
      const tx = db.transaction('chapters', 'readonly');
      const store = tx.objectStore('chapters');
      const request = store.getAll();
      return new Promise((resolve) => {
        request.onsuccess = () => {
          if (request.result && request.result.length > 0) {
            resolve(request.result);
          } else {
            const fallback = localStorage.getItem('offline_chapters');
            resolve(fallback ? JSON.parse(fallback) : []);
          }
        };
        request.onerror = () => resolve([]);
      });
    } catch (e) {
      const fallback = localStorage.getItem('offline_chapters');
      return fallback ? JSON.parse(fallback) : [];
    }
  },

  async saveLesson(lesson) {
    try {
      const db = await getDB();
      const tx = db.transaction('lessons', 'readwrite');
      tx.objectStore('lessons').put(lesson);
      return new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
      });
    } catch (e) {
      localStorage.setItem(`offline_lesson_${lesson.id}`, JSON.stringify(lesson));
    }
  },

  async getLesson(lessonId) {
    try {
      const db = await getDB();
      const tx = db.transaction('lessons', 'readonly');
      const request = tx.objectStore('lessons').get(Number(lessonId));
      return new Promise((resolve) => {
        request.onsuccess = () => {
          if (request.result) resolve(request.result);
          else {
            const local = localStorage.getItem(`offline_lesson_${lessonId}`);
            resolve(local ? JSON.parse(local) : null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (e) {
      const local = localStorage.getItem(`offline_lesson_${lessonId}`);
      return local ? JSON.parse(local) : null;
    }
  },

  async queueSyncAction(type, payload) {
    const item = {
      type,
      payload,
      createdAt: new Date().toISOString(),
      synced: false
    };

    try {
      const db = await getDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      tx.objectStore('sync_queue').add(item);
    } catch (e) {
      const current = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
      current.push(item);
      localStorage.setItem('offline_sync_queue', JSON.stringify(current));
    }
  },

  async getPendingSyncActions() {
    try {
      const db = await getDB();
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const request = store.getAll();
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const items = (request.result || []).filter((i) => !i.synced);
          const localItems = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
          resolve([...items, ...localItems]);
        };
        request.onerror = () => resolve([]);
      });
    } catch (e) {
      return JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
    }
  },

  async clearPendingSyncActions() {
    try {
      const db = await getDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      tx.objectStore('sync_queue').clear();
    } catch (e) {}
    localStorage.removeItem('offline_sync_queue');
  }
};
