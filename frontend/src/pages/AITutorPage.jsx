import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles, Send, Mic, Camera, Volume2, RotateCcw, 
  HelpCircle, User, Bot, AlertCircle, Loader2, Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';
import TeluguAudioPlayer from '../components/TeluguAudioPlayer';
import VoiceInputModal from '../components/VoiceInputModal';
import ImageUploadModal from '../components/ImageUploadModal';

export default function AITutorPage() {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const defaultGreeting = isEn
    ? `Hello ${user?.full_name?.split(' ')[0] || 'Raju'}! 🙏\n\nI am your personal **AI Math Tutor**.\nYou can ask me any concept or problem from Class 8 Mathematics:\n\n- 🔢 Rational Numbers & Fractions\n- ⚖️ Linear Equations (e.g. 2x + 5 = 15)\n- 📐 Understanding Quadrilaterals & Angles\n- 📊 Data Handling & Pie Charts\n- 🔲 Squares & Square Roots (e.g. √144)\n- 🧊 Cubes & Cube Roots\n\nYou can **type below**, **tap the microphone to speak**, or **snap a photo of a textbook problem**!`
    : `నమస్కారం ${user?.full_name?.split(' ')[0] || 'రాజు'}! 🙏\n\nనేను మీ వ్యక్తిగత **తెలుగు AI గణిత గురువుని**.\n8వ తరగతి గణితంలో మీకు ఏ పాఠంలో సందేహం ఉన్నా నన్ను అడగవచ్చు:\n\n- 🔢 అకరణీయ సంఖ్యలు & భిన్నాలు\n- ⚖️ రేఖీయ సమీకరణాలు (ఉదా: 2x + 5 = 15)\n- 📐 చతుర్భుజాలు & కోణాలు\n- 📊 దత్తాంశ నిర్వహణ & పై-చార్టులు\n- 🔲 వర్గాలు & వర్గమూలాలు (ఉదా: √144)\n- 🧊 ఘనాలు & ఘనమూలాలు\n\nమీ ప్రశ్నను ఇక్కడ **టైప్ చేయవచ్చు**, **మైక్ నొక్కి మాట్లాడవచ్చు**, లేదా పుస్తకం **ఫోటో తీసి అప్‌లోడ్ చేయవచ్చు**!`;

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: defaultGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: isEn ? 'Smart AI Tutor' : 'స్మార్ట్ AI గురువు'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState([]);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadQuickPrompts();
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadQuickPrompts = async () => {
    if (isEn) {
      setQuickPrompts([
        { label: "What are Fractions?", text: "What are Fractions? Explain with a daily life example." },
        { label: "Solve 2x + 5 = 15", text: "How to solve the linear equation 2x + 5 = 15 step by step?" },
        { label: "Square Root of 144", text: "Find the square root of 144 using prime factorisation." },
        { label: "Quadrilateral Angles", text: "What is the sum of angles in a quadrilateral and why?" },
        { label: "Properties of Rational Numbers", text: "Explain additive and multiplicative identities of rational numbers." },
        { label: "Give me a practice problem", text: "Give me an 8th class math practice problem on rational numbers." }
      ]);
    } else {
      try {
        const res = await api.getQuickPrompts();
        if (res.prompts) setQuickPrompts(res.prompts);
      } catch (e) {
        setQuickPrompts([
          { label: "భిన్నాలు అంటే ఏమిటి?", text: "భిన్నాలు అంటే ఏమిటి? నిత్య జీవిత ఉదాహరణతో వివరించండి." },
          { label: "2x + 5 = 15 సాధన", text: "2x + 5 = 15 సమీకరణాన్ని పక్షాంతరం ద్వారా ఎలా సాధించాలి?" },
          { label: "√144 వర్గమూలం", text: "144 యొక్క వర్గమూలం కారణాంకాల పద్ధతిలో ఎలా కనుగొనాలి?" },
          { label: "చతుర్భుజం కోణాలు", text: "చతుర్భుజంలో నాలుగు కోణాల మొత్తం ఎంత? ఎందుకు?" }
        ]);
      }
    }
  };

  const handleSendMessage = async (textToSend = inputText, msgType = 'text') => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMessageId = Date.now();
    const newUserMsg = {
      id: userMessageId,
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: msgType
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const topic = isEn ? 'Class 8 Mathematics (English)' : '8వ తరగతి గణితం';
      const res = await api.sendChatMessage(text, user?.id, topic, msgType);
      const aiReply = {
        id: Date.now() + 1,
        role: 'assistant',
        text: res.reply || (isEn ? 'Sorry, I encountered an issue processing your question. Please try asking again.' : 'క్షమించండి, మీ ప్రశ్నకు సమాధానం ఇవ్వడంలో సమస్య ఎదురైంది.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: res.provider || (isEn ? 'Smart AI Tutor' : 'Smart AI')
      };
      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      console.warn('AI request error:', err);
      const fallbackReply = {
        id: Date.now() + 1,
        role: 'assistant',
        text: isEn 
          ? `Your question: **"${text}"**.\n\nNetwork is currently slow or offline. Review your textbook examples for this topic, and as soon as connectivity returns we will break down the full solution! 😊`
          : `మీరు అడిగిన ప్రశ్న: **"${text}"**.\n\nప్రస్తుతం నెట్‌వర్క్ నెమ్మదిగా ఉంది. పాఠ్యపుస్తకంలోని ఉదాహరణలను ఒకసారి పునశ్చరణ చేయండి. ఇంటర్నెట్ రాగానే మరింత సాధిద్దాం! 😊`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: isEn ? 'Offline Guidance' : 'ఆఫ్‌లైన్ గైడెన్స్'
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageResult = (result) => {
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: `[${isEn ? 'Photo Question' : 'ఫోటో ప్రశ్న'}]: ${result.extractedText}`,
      mediaUrl: result.imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'image'
    };

    const aiMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      text: result.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: isEn ? 'Photo OCR + AI Tutor' : 'ఫోటో OCR + AI గురువు'
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-28 md:pb-24 flex flex-col min-h-[calc(100vh-4rem)]">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{isEn ? "AI Math Tutor" : "AI గణిత గురువు (AI Math Tutor)"}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {isEn ? "Patient Personal Teacher" : "సహనంగల వ్యక్తిగత ఉపాధ్యాయుడు"}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              {isEn ? "Ask doubts • Real-life examples • Step-by-step reasoning" : "తెలుగులో అడగండి • నిత్య జీవిత ఉదాహరణలు • దశలవారీ సాధన"}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 1,
                role: 'assistant',
                text: defaultGreeting,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                provider: isEn ? 'Smart AI Tutor' : 'స్మార్ట్ AI గురువు'
              }
            ]);
          }}
          className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors"
          title={isEn ? "Reset Chat" : "చాట్ రీసెట్ చేయండి"}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isEn ? "Restart" : "మళ్ళీ ప్రారంభించు"}</span>
        </button>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="mb-3 overflow-x-auto pb-1 flex gap-1.5 no-scrollbar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.text)}
            className="text-[11px] font-bold bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-200 px-3 py-1.5 rounded-full shrink-0 shadow-2xs transition-all cursor-pointer"
          >
            💡 {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-y-auto space-y-5 mb-3 min-h-[350px] max-h-[55vh]">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-2xs font-bold ${
                  isUser
                    ? 'bg-orange-600 text-white'
                    : 'bg-linear-to-br from-amber-500 to-orange-500 text-white'
                }`}
              >
                {isUser ? '🎒' : '🤖'}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                  isUser
                    ? 'bg-orange-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                {/* User Image Media Preview if any */}
                {m.mediaUrl && (
                  <div className="mb-2">
                    <img
                      src={m.mediaUrl}
                      alt="Uploaded math problem"
                      className="max-h-36 rounded-lg object-contain border border-white/20"
                    />
                  </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-line font-normal">
                  {m.text}
                </div>

                {/* Footer bar with Audio Speaker */}
                <div
                  className={`mt-3 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] border-t ${
                    isUser ? 'border-orange-500/50 text-orange-200' : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="font-semibold">{m.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{m.provider}</span>
                      <TeluguAudioPlayer text={m.text} label={isEn ? "Listen" : "చదివి వినిపించు"} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-xs">
            <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
            <span className="text-xs font-semibold">
              {isEn ? "AI Tutor is thinking..." : "AI గురువు ఆలోచిస్తున్నారు..."}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-lg p-2 sm:p-3 relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="p-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors cursor-pointer shrink-0"
            title={isEn ? "Ask by voice" : "వాయిస్ ప్రశ్న అడగండి"}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Photo Question Scanner Button */}
          <button
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer shrink-0"
            title={isEn ? "Scan textbook problem photo" : "ఫోటో తీసి అప్‌లోడ్ చేయండి"}
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Text Input Area */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isEn ? "Ask any math problem (e.g. How to solve 2x + 5 = 15?)..." : "మీ ప్రశ్నను టైప్ చేయండి (ఉదా: 2x + 5 = 15 ను ఎలా సాధించాలి?)..."}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{isEn ? "Ask" : "అడగండి"}</span>
          </button>
        </form>
      </div>

      {/* Voice & Image Modals */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendQuestion={(q) => handleSendMessage(q, 'voice')}
      />

      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageAnalyzed={handleImageResult}
      />

    </div>
  );
}
