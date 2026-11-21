import React from 'react';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function OfflineBanner() {
  const { isOnline, pendingSyncCount, syncNow, isSyncing, lastSyncMessage, toggleOfflineSimulation } = useOffline();
  const { lang, t } = useLanguage();
  const isEn = lang === 'en';

  if (isOnline && pendingSyncCount === 0 && !lastSyncMessage) {
    return null;
  }

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2.5 transition-all sticky top-16 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        
        {/* Status Message */}
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isEn ? (
                  <>You are in <strong>Offline Mode</strong>. Downloaded lessons and quizzes work seamlessly.</>
                ) : (
                  <>మీరు ప్రస్తుతం <strong>ఆఫ్‌లైన్ మోడ్</strong> లో ఉన్నారు. డౌన్‌లోడ్ చేసిన పాఠాలు & క్విజ్‌లు పనిచేస్తాయి.</>
                )}
              </span>
            </div>
          ) : lastSyncMessage ? (
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lastSyncMessage}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
              <span>
                {isEn ? (
                  <>You have <strong>{pendingSyncCount}</strong> unsynced offline records.</>
                ) : (
                  <>మీ వద్ద <strong>{pendingSyncCount}</strong> సింక్ చేయని ఆఫ్‌లైన్ అంశాలు ఉన్నాయి.</>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {pendingSyncCount > 0 && isOnline && (
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing 
                  ? (isEn ? "Syncing..." : "సింక్ అవుతోంది...") 
                  : (isEn ? "Sync with Server" : "సర్వర్‌తో సింక్ చేయండి")}
              </span>
            </button>
          )}

          {!isOnline && (
            <button
              onClick={toggleOfflineSimulation}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer transition-colors"
            >
              {isEn ? "Switch to Online" : "ఆన్‌లైన్ స్విచ్"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
