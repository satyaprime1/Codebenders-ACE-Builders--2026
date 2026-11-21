import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Sparkles, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ImageUploadModal({ isOpen, onClose, onImageAnalyzed }) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const samplePresets = [
    {
      title: "రేఖీయ సమీకరణం (Linear Eq)",
      expression: "2x + 7 = 19",
      desc: "పాఠ్యపుస్తకంలోని 8వ తరగతి సమీకరణం"
    },
    {
      title: "వర్గమూలం (Square Root)",
      expression: "√144 = ?",
      desc: "చేతిరాతతో రాసిన వర్గమూల సమస్య"
    },
    {
      title: "చతుర్భుజ కోణాలు (Quadrilateral)",
      expression: "80°, 110°, 70° => 4వ కోణం ఎంత?",
      desc: "నోట్‌బుక్ చిత్రం"
    },
    {
      title: "అకరణీయ సంఖ్యలు (Fractions)",
      expression: "3/5 + 2/7 = ?",
      desc: "రెండు భిన్నాల సంకలనం"
    }
  ];

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const handleSelectPreset = async (preset) => {
    // Generate a quick canvas blob image for the preset
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 200);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(preset.expression, 50, 100);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('8వ తరగతి గణితం - అభ్యాస సమస్య', 50, 140);

    canvas.toBlob((blob) => {
      const file = new File([blob], `${preset.title.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    });
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('user_id', user?.id || 1);
      formData.append('context_topic', 'గణిత సమస్య');

      const response = await fetch('/api/ai/upload-question', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ఫోటో ప్రాసెస్ చేయడంలో విఫలమైంది');
      }

      onImageAnalyzed({
        extractedText: data.extracted_text,
        imageUrl: data.image_url,
        reply: data.reply
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'సర్వర్ సమస్య, దయచేసి మళ్ళీ ప్రయత్నించండి.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-orange-100 flex flex-col relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>ఫోటో ప్రశ్న స్కానర్ (Photo Question)</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            పాఠ్యపుస్తకం లేదా నోట్‌బుక్ ఫోటో తీయండి
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            లెక్కల ప్రశ్నను ఫోటో తీసి అప్‌లోడ్ చేస్తే AI గురువు తెలుగులో పరిష్కారం అందిస్తారు
          </p>
        </div>

        {/* Drop / Preview Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all mb-4 ${
            previewUrl 
              ? 'border-orange-400 bg-orange-50/30' 
              : 'border-slate-300 hover:border-orange-400 bg-slate-50 hover:bg-orange-50/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {previewUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={previewUrl}
                alt="Selected Math Problem"
                className="max-h-48 rounded-xl object-contain border border-slate-200 shadow-xs"
              />
              <span className="text-xs font-semibold text-orange-700">
                ఫోటో మార్చడానికి క్లిక్ చేయండి
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                ఫోటో ఎంచుకోవడానికి ఇక్కడ తాకండి
              </p>
              <p className="text-xs text-slate-400 mt-1">
                కెమెరా లేదా గ్యాలరీ నుండి (JPG, PNG)
              </p>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5 mb-3 text-center">
            {errorMessage}
          </p>
        )}

        {/* Presets for Testing */}
        <div className="mb-4">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>లేదా ఉదాహరణ నమూనా లెక్కను ఎంచుకోండి (1-క్లిక్ టెస్ట్):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {samplePresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800">{p.title}</div>
                <div className="text-xs font-semibold text-orange-600 mt-0.5">{p.expression}</div>
                <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            రద్దు చేయండి
          </button>
          <button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || isLoading}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ఫోటో విశ్లేషిస్తోంది...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>సమస్యను పరిష్కరించండి</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
