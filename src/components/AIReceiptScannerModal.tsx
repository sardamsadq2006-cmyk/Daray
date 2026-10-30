import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Receipt,
  Check,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { Transaction, BankAccount, Currency } from '../types/finance';

interface AIReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  accounts: BankAccount[];
}

export const AIReceiptScannerModal: React.FC<AIReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onReceiptScanned,
  accounts,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setScannedResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setIsCameraActive(false);
      setErrorMsg('نەتوانرا کامێرا بکرێتەوە، تکایە ڕێگەپێدانی کامێرا بدە یان وێنە باربکە.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleUseSampleReceipt = () => {
    // Generate a mock realistic receipt canvas for instant demonstration
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 550);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('مارکێتی فامیلی مۆڵ - هەولێر', 200, 45);

      ctx.font = '13px sans-serif';
      ctx.fillText('پسولەی کڕینی کاڵاکان', 200, 75);
      ctx.fillText('ڕێکەوت: 2026-10-29', 200, 95);

      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(30, 115);
      ctx.lineTo(370, 115);
      ctx.stroke();

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('شیر و بەرهەمە سپیاییەکان: 12,000 د.ع', 370, 150);
      ctx.fillText('گۆشتی مریشکی فرێش: 18,000 د.ع', 370, 185);
      ctx.fillText('میوە و سەوزەوات: 15,000 د.ع', 370, 220);
      ctx.fillText('ڕۆنی تورکی ٥ لیتر: 15,000 د.ع', 370, 255);

      ctx.beginPath();
      ctx.moveTo(30, 290);
      ctx.lineTo(370, 290);
      ctx.stroke();

      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('کۆی گشتی: 60,000 دیناری عێراقی', 370, 330);

      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('سوپاس بۆ کڕینەکەت، بەخێربێنەوە', 200, 390);

      const sampleUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(sampleUrl);
      setScannedResult(null);
      setErrorMsg(null);
    }
  };

  const handleAnalyzeWithGemini = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: 'image/jpeg',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'هەڵەیەک ڕوویدا لە کاتی شیکاریکردنی پسولەکە');
      }

      setScannedResult(data.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'نەتوانرا پسولەکە بخوێندرێتەوە. تکایە دووبارە تاقی بکەرەوە.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAndAdd = () => {
    if (!scannedResult) return;

    const newTx: Omit<Transaction, 'id' | 'createdAt'> = {
      type: 'expense',
      title: scannedResult.title || 'خەرجی پسولە',
      amount: Number(scannedResult.totalAmount) || 0,
      currency: (scannedResult.currency === 'USD' ? 'USD' : 'IQD') as Currency,
      category: scannedResult.suggestedCategory || 'خۆراک',
      date: scannedResult.date || new Date().toISOString().split('T')[0],
      accountId: selectedAccountId || accounts[0]?.id || 'acc-cash',
      notes: scannedResult.notes || `خوێندراوەتەوە بە AI (${scannedResult.title})`,
      receiptImage: selectedImage || undefined,
      items: scannedResult.items || [],
    };

    onReceiptScanned(newTx);
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setSelectedImage(null);
    setScannedResult(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="سکانی پسولە بە زیرەکی دەستکرد"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>سکانی پسولە بە زیرەکی دەستکرد (AI)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Gemini 3.8
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ڕەسمی پسولەکە بگرە، هەموو کاڵا و پارەکە ئۆتۆماتیکی دەنوسرێت
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="داخستن"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Camera View or Upload Area */}
        {isCameraActive ? (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] mb-4 flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400/60 m-6 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-xs text-emerald-300 bg-slate-900/80 px-3 py-1 rounded-full">
                پسولەکە لە ناو ئەم چوارچێوەیە دابنێ
              </span>
            </div>
            <div className="absolute bottom-4 flex items-center gap-3">
              <button
                onClick={capturePhoto}
                aria-label="گرتنی وێنە"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>گرتنی وێنە</span>
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 cursor-pointer"
              >
                پەشیمانبوونەوە
              </button>
            </div>
          </div>
        ) : selectedImage ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 mb-4 max-h-64 flex items-center justify-center group">
            <img
              src={selectedImage}
              alt="پسولەی دیاریکراو"
              className="max-h-64 object-contain"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setScannedResult(null);
              }}
              aria-label="سڕینەوەی وێنە"
              className="absolute top-2 left-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white shadow-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-950/40 mb-4 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              ڕەسمی پسولەکەت باربکە یان وێنەی بگرە
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              پشتیوانی پسولەی کوردی، عێراقی (دینار) و دۆلار دەکات
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={startCamera}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>کامێرا بکەرەوە</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>هەڵبژاردنی وێنە</span>
              </button>

              <button
                onClick={handleUseSampleReceipt}
                className="py-2 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-xs font-medium flex items-center gap-2 border border-emerald-500/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>نموونەی پسولەی کوردی</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Action button: Analyze with Gemini */}
        {selectedImage && !scannedResult && (
          <button
            onClick={handleAnalyzeWithGemini}
            disabled={isAnalyzing}
            aria-label="شیکاریکردنی پسولە بە زیرەکی دەستکرد"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all mb-4"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>زیرەکی دەستکرد شیکاری دەکات (خوێندنەوەی کاڵا و نرخ)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>شیکاریکردنی پسولە بە Gemini AI</span>
              </>
            )}
          </button>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* AI Scanned Result Form */}
        {scannedResult && (
          <div className="bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-4 mb-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>پسولەکە بە سەرکەوتوویی خوێندرایەوە!</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {scannedResult.date}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Store className="w-3 h-3 text-emerald-400" />
                  <span>ناوی شوێن / فرۆشگا</span>
                </label>
                <input
                  type="text"
                  value={scannedResult.title}
                  onChange={(e) =>
                    setScannedResult({ ...scannedResult, title: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">
                  کۆی گشتی ({scannedResult.currency})
                </label>
                <input
                  type="number"
                  value={scannedResult.totalAmount}
                  onChange={(e) =>
                    setScannedResult({
                      ...scannedResult,
                      totalAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">
                  جۆری خەرجی
                </label>
                <input
                  type="text"
                  value={scannedResult.suggestedCategory}
                  onChange={(e) =>
                    setScannedResult({
                      ...scannedResult,
                      suggestedCategory: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">
                  سەرفکردن لە هەژماری
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Extracted items */}
            {scannedResult.items && scannedResult.items.length > 0 && (
              <div className="mt-2">
                <span className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-emerald-400" />
                  <span>کاڵا تۆمارکراوەکان:</span>
                </span>
                <div className="bg-slate-900/80 rounded-xl p-2 max-h-32 overflow-y-auto space-y-1 divide-y divide-slate-800 text-xs">
                  {scannedResult.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between pt-1 first:pt-0"
                    >
                      <span className="text-slate-300">
                        {item.name} {item.qty ? `(x${item.qty})` : ''}
                      </span>
                      <span className="text-emerald-400 font-mono">
                        {item.price.toLocaleString()} {scannedResult.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmAndAdd}
              aria-label="تۆمارکردن لە خەرجی ڕۆژانە"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
            >
              <Check className="w-4 h-4" />
              <span>تۆمارکردن لە خەرجی ڕۆژانە</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
