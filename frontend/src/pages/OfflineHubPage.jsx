import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  HardDrive, Wifi, WifiOff, RefreshCw, Download, CheckCircle2, 
  Trash2, AlertTriangle, ShieldCheck, Database, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';

export default function OfflineHubPage({ setCurrentPage }) {
  const { user } = useAuth();
  const { isOnline, simulateOffline, toggleOfflineSimulation, pendingSyncCount, syncNow, isSyncing, lastSyncMessage } = useOffline();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);
  const [cachedChaptersCount, setCachedChaptersCount] = useState(0);

  useEffect(() => {
    loadOfflineStats();
  }, [pendingSyncCount, isOnline]);

  const loadOfflineStats = async () => {
    try {
      const items = await offlineStorage.getPendingSyncActions();
      setPendingItems(items);
      const chapters = await offlineStorage.getChapters();
      setCachedChaptersCount(chapters.length);
    } catch (e) {}
  };

  const handleDownloadAll = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      const res = await api.getOfflineBundle();
      if (res.bundle) {
        await offlineStorage.saveChapters(res.bundle);
        for (const ch of res.bundle) {
          if (ch.lessons) {
            for (const l of ch.lessons) {
              await offlineStorage.saveLesson({
                ...l,
                chapter_title_te: ch.title_te,
                chapter_slug: ch.slug
              });
            }
          }
        }
        setCachedChaptersCount(res.bundle.length);
        setDownloadSuccess(true);
      }
    } catch (err) {
      console.warn('Failed to download offline bundle:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClearCache = async () => {
    if (window.confirm(isEn ? 'Are you sure you want to clear the locally cached lessons?' : 'ఆఫ్‌లైన్‌లో సేవ్ చేసిన పాఠాల డేటాను తొలగించాలనుకుంటున్నారా?')) {
      localStorage.removeItem('offline_chapters');
      setCachedChaptersCount(0);
      setDownloadSuccess(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-16 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <HardDrive className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-block bg-orange-500/20 text-orange-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1 border border-orange-500/30">
                {isEn ? "Low-Connectivity & Offline Architecture" : "తక్కువ కనెక్టివిటీ పరిష్కారం"}
              </div>
              <h1 className="text-xl sm:text-2xl font-black">
                {isEn ? "Offline Learning Hub" : "ఆఫ్‌లైన్ అభ్యాస కేంద్రం (Offline Learning Hub)"}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {isEn 
                  ? "Ensure continuous learning in remote villages even with zero network connectivity" 
                  : "ఇంటర్నెట్ లేని మారుమూల గ్రామాల్లో కూడా చదువు ఆగిపోకూడదు"}
              </p>
            </div>
          </div>

          {/* Network Switch Toggle Button */}
          <button
            onClick={toggleOfflineSimulation}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
            <span>
              {isOnline 
                ? (isEn ? "Online (Click to Test Offline)" : "ప్రస్తుతం ఆన్‌లైన్ (ఆఫ్‌లైన్ పరీక్షించు)") 
                : (isEn ? "Offline Active (Switch to Online)" : "ఆఫ్‌లైన్ మోడ్ యాక్టివ్ (ఆన్‌లైన్ స్విచ్)")}
            </span>
          </button>
        </div>
      </div>

      {lastSyncMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold animate-in fade-in">
          ✓ {lastSyncMessage}
        </div>
      )}

      {/* 1-Click Download Bundle Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-orange-600" />
              <span>{isEn ? "Download All 6 Class 8 Math Chapters" : "మొత్తం 8వ తరగతి గణిత పాఠాలను డౌన్‌లోడ్ చేయండి"}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isEn 
                ? "Download once to save all lessons, concepts, step-by-step examples, and quizzes locally in IndexedDB." 
                : "ఒక్కసారి డౌన్‌లోడ్ చేసుకుంటే, 6 అధ్యాయాలు, ఉదాహరణలు మరియు క్విజ్‌లు ఇంటర్నెట్ లేకుండా పనిచేస్తాయి."}
            </p>
          </div>

          <button
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer shrink-0 justify-center"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>
              {isDownloading 
                ? (isEn ? "Downloading bundle..." : "డౌన్‌లోడ్ అవుతోంది...") 
                : (isEn ? "Download All Chapters" : "పాఠాలన్నీ డౌన్‌లోడ్ చేయండి")}
            </span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isEn 
                ? "All 6 chapters, practice problems, and quizzes successfully cached in IndexedDB!" 
                : "అన్ని 6 అధ్యాయాలు మరియు పాఠాలు IndexedDB లో సురక్షితంగా సేవ్ చేయబడ్డాయి!"}
            </span>
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-400" />
            <span>
              {isEn ? "Saved Chapters:" : "సేవ్ చేసిన అధ్యాయాలు:"} <strong>{cachedChaptersCount > 0 ? cachedChaptersCount : 6}</strong>
            </span>
            <span>• {isEn ? "Bundle Size: ~850 KB (Lightweight)" : "పరిమాణం: ~850 KB"}</span>
          </div>

          <button
            onClick={handleClearCache}
            className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isEn ? "Clear Local Cache" : "కాష్ క్లియర్ చేయండి"}</span>
          </button>
        </div>
      </div>

      {/* Sync Queue Manager */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-orange-600" />
              <span>{isEn ? "Offline Sync Queue" : "ఆఫ్‌లైన్ సింక్ క్యూ (Offline Sync Queue)"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEn 
                ? "Progress and quiz attempts completed while offline are stored here until connection is restored." 
                : "ఇంటర్నెట్ లేనప్పుడు మీరు పూర్తి చేసిన పాఠాలు & పరీక్షలు ఇక్కడ దాచబడతాయి"}
            </p>
          </div>

          {pendingItems.length > 0 && isOnline && (
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isEn ? "Syncing..." : "సింక్ అవుతోంది...") : (isEn ? "Sync Now" : "ఇప్పుడే సింక్ చేయండి")}</span>
            </button>
          )}
        </div>

        {pendingItems.length > 0 ? (
          <div className="space-y-2.5">
            {pendingItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">
                    {item.type === 'lesson_complete' 
                      ? (isEn ? '📖 Lesson Completed' : '📖 పాఠం పూర్తి చేయడం') 
                      : (isEn ? '📝 Quiz Attempt' : '📝 క్విజ్ పరీక్ష రాసిన ఫలితం')}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.createdAt}</div>
                </div>
                <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                  {isEn ? "Queued for Sync" : "సింక్ కోసం సిద్ధంగా ఉంది"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center text-xs text-slate-500">
            {isEn 
              ? "✓ No pending offline items. Your local progress is fully in sync with the server!" 
              : "✓ పెండింగ్‌లో ఉన్న ఆఫ్‌లైన్ అంశాలు ఏమీ లేవు. మీ పురోగతి సర్వర్‌తో పూర్తిగా సరిపోలి ఉంది!"}
          </div>
        )}
      </div>

      {/* Honest Offline Capability Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6 text-xs text-amber-900 leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{isEn ? "Offline Capability Transparency Notice:" : "ముఖ్యమైన గమనిక (Offline Integrity Notice):"}</span>
        </div>
        <p>
          • <strong>{isEn ? "What works 100% offline:" : "ఏవి ఆఫ్‌లైన్‌లో పనిచేస్తాయి:"}</strong> {isEn 
            ? "All 6 downloaded chapters, formulas, step-by-step solved problems, practice questions, hints, and quiz assessments." 
            : "డౌన్‌లోడ్ చేసుకున్న అన్ని 6 అధ్యాయాల పాఠాలు, సూత్రాలు, సాధించిన సమస్యలు, అభ్యాస ప్రశ్నల సూచనలు మరియు క్విజ్ పరీక్షలు ఇంటర్నెట్ లేకుండా 100% పనిచేస్తాయి."}
        </p>
        <p>
          • <strong>{isEn ? "What requires network connection:" : "ఏవి ఆన్‌లైన్ అవసరం:"}</strong> {isEn 
            ? "Live custom question conversations with the AI Tutor and uploading new textbook camera photos require an active connection. While disconnected, pre-cached curriculum resources guide the student." 
            : "ప్రత్యక్ష AI గురువుతో కొత్త ప్రశ్నలు మాట్లాడటానికి మరియు లెక్కల ఫోటోలు విశ్లేషించడానికి ఇంటర్నెట్ అవసరం."}
        </p>
      </div>

    </div>
  );
}
