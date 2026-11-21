import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, Globe, Volume2, Shield, Key, HardDrive, 
  Check, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { lang, switchLanguage } = useLanguage();
  const { user } = useAuth();
  const isEn = lang === 'en';

  const [speechRate, setSpeechRate] = useState(0.9);
  const [dataSaver, setDataSaver] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-16 space-y-6">
      
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>{isEn ? "App Preferences" : "అనుకూలీకరణ (App Settings)"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {isEn ? "Settings & Language Selection" : "సెట్టింగులు & భాషా ఎంపిక"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isEn ? "Customize language preference, voice speed, and data privacy options." : "భాష, ఆడియో వేగం మరియు గోప్యతా వివరాలను ఇక్కడ సర్దుబాటు చేసుకోవచ్చు."}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{isEn ? "Settings saved successfully!" : "సెట్టింగులు విజయవంతంగా భద్రపరచబడ్డాయి!"}</span>
        </div>
      )}

      {/* 1. Language Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Globe className="w-5 h-5 text-orange-600" />
          <h2 className="text-base sm:text-lg font-bold">
            {isEn ? "Language Selection" : "భాషా ఎంపిక (Language Selection)"}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {isEn 
            ? "Choose your primary language. The entire interface adapts instantly." 
            : "విద్యార్థి సౌలభ్యం కోసం పూర్తి అప్లికేషన్ సరళమైన తెలుగులో లేదా ఆంగ్లంలో అందించబడుతుంది."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => switchLanguage('en')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              isEn
                ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div>
              <div className="text-sm font-bold">English (Default Active)</div>
              <div className="text-xs text-slate-500 mt-0.5">International & Bilingual interface</div>
            </div>
            {isEn && <Check className="w-5 h-5 text-orange-600 shrink-0" />}
          </button>

          <button
            onClick={() => switchLanguage('te')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              !isEn
                ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div>
              <div className="text-sm font-bold">తెలుగు (Telugu - Regional Language)</div>
              <div className="text-xs text-slate-500 mt-0.5">8వ తరగతి ప్రభుత్వ పాఠశాల మాధ్యమం</div>
            </div>
            {!isEn && <Check className="w-5 h-5 text-orange-600 shrink-0" />}
          </button>
        </div>
      </div>

      {/* 2. Audio & Speech Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Volume2 className="w-5 h-5 text-orange-600" />
          <h2 className="text-base sm:text-lg font-bold">
            {isEn ? "Audio & Speech Playback Rate" : "ధ్వని మరియు ఉచ్ఛారణ (Audio & Speech Settings)"}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {isEn 
            ? "Adjust the speed at which lesson audio and AI Tutor explanations are read aloud:" 
            : "పాఠాలు మరియు AI సమాధానాలు చదివి వినిపించే వేగాన్ని ఇక్కడ మార్చుకోండి:"}
        </p>

        <div className="flex items-center gap-3">
          {[
            { label: isEn ? 'Slow (0.75x)' : 'నెమ్మదిగా (0.75x)', val: 0.75 },
            { label: isEn ? 'Normal (0.9x)' : 'సాధారణం (0.9x)', val: 0.9 },
            { label: isEn ? 'Fast (1.1x)' : 'వేగంగా (1.1x)', val: 1.1 }
          ].map(s => (
            <button
              key={s.val}
              onClick={() => setSpeechRate(s.val)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                speechRate === s.val
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Data Saver Mode */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEn ? "Data Saver Mode (Low-End Smartphone Optimizations)" : "డేటా సేవర్ మోడ్ (Data Saver Mode)"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEn 
                ? "Reduces animation overhead and asset payloads for basic smartphones on 2G/3G connections" 
                : "సాధారణ 2G/3G మొబైల్ నెట్‌వర్క్‌ల కోసం గ్రాఫిక్స్ మరియు యానిమేషన్ల డేటాను తగ్గిస్తుంది"}
            </p>
          </div>

          <button
            onClick={() => setDataSaver(!dataSaver)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
              dataSaver ? 'bg-orange-600' : 'bg-slate-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              dataSaver ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* 4. Privacy & Minor Protection Notice */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-emerald-800">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            {isEn ? "Minor Privacy & Data Protection Notice" : "బాలల గోప్యత మరియు డేటా భద్రత (Minor Privacy)"}
          </h3>
        </div>

        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-slate-700 space-y-2 leading-relaxed">
          <p>
            • <strong>{isEn ? "Minimum Data Collection:" : "కనీస వివరాల సేకరణ:"}</strong> {isEn 
              ? "We collect only minimal learner profile details required for educational tracking. No sensitive personal data is gathered." 
              : "మైనర్ విద్యార్థుల నుండి ఎటువంటి అనవసరమైన లేదా సున్నితమైన వ్యక్తిగత సమాచారం సేకరించబడదు."}
          </p>
          <p>
            • <strong>{isEn ? "Transparent Parent Oversight:" : "తల్లిదండ్రుల నిఘా:"}</strong> {isEn 
              ? "Learning progress and quiz reports are transparently accessible through the Parent Portal." 
              : "విద్యార్థి చదువు పురోగతి నివేదికలు తల్లిదండ్రుల పోర్టల్ ద్వారా పారదర్శకంగా పర్యవేక్షించబడతాయి."}
          </p>
          <p>
            • <strong>{isEn ? "Safe Educational AI Sandbox:" : "సురక్షిత అభ్యాస వాతావరణం:"}</strong> {isEn 
              ? "The AI Tutor operates strictly within the curated Class 8 curriculum boundary." 
              : "AI గురువు కేవలం 8వ తరగతి పాఠ్యాంశాలకు సంబంధించిన గణిత సందేహాలు మరియు విద్యను మాత్రమే అందిస్తుంది."}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-2xl shadow-md transition-all cursor-pointer"
        >
          {isEn ? "Save Preferences" : "సెట్టింగులను భద్రపరచండి"}
        </button>
      </div>

    </div>
  );
}
