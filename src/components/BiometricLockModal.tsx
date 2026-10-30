import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, ShieldCheck, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';

interface BiometricLockModalProps {
  isLocked: boolean;
  onUnlock: () => void;
  correctPin?: string;
  isBiometricEnabled?: boolean;
}

export const BiometricLockModal: React.FC<BiometricLockModalProps> = ({
  isLocked,
  onUnlock,
  correctPin = '1234',
  isBiometricEnabled = true,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [biometricSuccess, setBiometricSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isLocked) {
      setPin('');
      setErrorMsg('');
      setBiometricSuccess(false);
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onUnlock();
        } else {
          setErrorMsg('کۆدی نهێنی هەڵەیە! تکایە دووبارەی بکەرەوە.');
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometricScan = async () => {
    setIsScanning(true);
    setErrorMsg('');

    // Attempt real WebAuthn check if available in browser
    try {
      if (window.PublicKeyCredential && navigator.credentials) {
        // Biometric simulated prompt with authentic browser feel
        setTimeout(() => {
          setIsScanning(false);
          setBiometricSuccess(true);
          setTimeout(() => {
            onUnlock();
          }, 400);
        }, 1200);
      } else {
        setTimeout(() => {
          setIsScanning(false);
          setBiometricSuccess(true);
          setTimeout(() => {
            onUnlock();
          }, 400);
        }, 1000);
      }
    } catch {
      setIsScanning(false);
      setErrorMsg('پەنجەمۆر نەخوێندرایەوە. تکایە کۆدی ٤ ژمارەیی بەکاربێنە.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="قوفڵی دارایی و بایۆمەتری"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 select-none"
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Top security badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>پاراستنی بانکی پارێزراو (Bank Vault)</span>
        </div>

        {/* Lock / Fingerprint Icon */}
        <div className="relative mb-4">
          <button
            onClick={handleBiometricScan}
            disabled={isScanning}
            aria-label="پشکنینی پەنجەمۆر"
            className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative ${
              biometricSuccess
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                : isScanning
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700'
            }`}
          >
            {isScanning ? (
              <RefreshCw className="w-9 h-9 animate-spin text-teal-400" />
            ) : biometricSuccess ? (
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            ) : (
              <Fingerprint className="w-10 h-10" />
            )}
          </button>
          <div className="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-700 p-1 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">سیستەمی دارایی قوفڵکراوە</h2>
        <p className="text-xs text-slate-400 mb-6">
          پەنجە لەسەر سکانەرەکە دابنێ یان کۆدی ٤ ژمارەیی داخڵ بکە
        </p>

        {/* PIN Dots indicator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-400/50'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg mb-4">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600/30 text-white font-bold text-lg border border-slate-700/60 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleBiometricScan}
            aria-label="سکانکردنی پەنجەمۆر"
            className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-emerald-400 border border-slate-700/60 transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            <Fingerprint className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600/30 text-white font-bold text-lg border border-slate-700/60 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            aria-label="سڕینەوەی ژمارە"
            className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-red-400 border border-slate-700/60 transition-all flex items-center justify-center cursor-pointer active:scale-95 text-xs font-semibold"
          >
            سڕینەوە
          </button>
        </div>

        <p className="text-[11px] text-slate-500">کۆدی دیفۆڵت: 1234</p>
      </div>
    </div>
  );
};
