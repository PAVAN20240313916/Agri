import React, { useState, useEffect } from 'react';
import { Sprout, Sparkles, BrainCircuit, ShieldAlert } from 'lucide-react';

const PROGRESS_STEPS = [
  { text: "Ingesting crop parameters & leaf imagery...", duration: 2200 },
  { text: "Gemini 2.5 Flash analyzing visual lesions & tissue necrosis...", duration: 2600 },
  { text: "Cross-referencing phytopathological taxonomy & soil dynamics...", duration: 2400 },
  { text: "Synthesizing organic biocontrols & chemical dosage protocols...", duration: 2200 },
  { text: "Validating safety warnings & compiling actionable checklist...", duration: 2000 },
];

export default function LoadingSpinner({ onCancel }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PROGRESS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2400);

    const progressTimer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 92) return 92;
        return prev + 4;
      });
    }, 350);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central Animated Graphic */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Sprout className="w-8 h-8 animate-pulse text-emerald-600" />
          </div>
        </div>

        {/* Header */}
        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <span>AI Crop Diagnostic in Progress</span>
          <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
        </h3>

        {/* Dynamic Status Text */}
        <p className="text-sm font-medium text-emerald-700 min-h-[48px] flex items-center justify-center mt-2 px-2 transition-all">
          {PROGRESS_STEPS[currentStepIndex].text}
        </p>

        {/* Progress Bar */}
        <div className="mt-4 mb-2">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5 font-medium">
            <span>Powered by Gemini 2.5 Flash</span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Agronomic Tip */}
        <div className="mt-6 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-left flex items-start gap-2.5">
          <BrainCircuit className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Field Tip:</strong> Prompt isolation of infected foliage reduces spore load exponentially, preventing secondary infection cycles across adjacent crop rows.
          </p>
        </div>
      </div>
    </div>
  );
}

