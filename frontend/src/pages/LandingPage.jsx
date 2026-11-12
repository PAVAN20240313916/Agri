import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  Camera, 
  CheckCircle2, 
  Activity, 
  Leaf, 
  Database,
  Lock,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, loginAsDemo } = useAuth();

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Subtle background blur accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next-Gen Gemini 2.5 Flash Multimodal Vision</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Empowering Farmers with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800">Precision Crop AI</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Bridge complex agricultural science and farm-level decisions. Upload leaf imagery, input soil and irrigation parameters, and receive structured, scientifically verified treatment plans in seconds.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to={user ? "/advisory/new" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 hover:scale-[1.02] transition-all"
              >
                <Sprout className="w-5 h-5" />
                <span>Start New Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {!user && (
                <button
                  type="button"
                  onClick={() => loginAsDemo()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Try 1-Click Demo Account
                </button>
              )}
            </div>

            {/* Security & Tech Guarantee */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Strict Zod & RLS Isolation
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                94%+ Diagnostic Confidence
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                Secure Supabase Auth & PostgreSQL
              </span>
            </div>

          </div>

          {/* Interactive Feature Visual Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-3 bg-gradient-to-b from-slate-200/80 to-slate-100/50 shadow-2xl border border-slate-200/80">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Sample AI Advisory Output</span>
                  <h3 className="text-xl font-bold text-slate-900">Early Blight (Alternaria solani) on Tomato</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">
                    Severe Risk
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    94.5% Confidence Match
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Immediate Action</span>
                  <p className="text-xs text-slate-800 font-medium">Prune infected foliage & sanitize shears between plants with 70% alcohol.</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <span className="text-xs font-semibold text-emerald-700 uppercase">Organic Remedy</span>
                  <p className="text-xs text-emerald-950 font-medium">Apply Copper Octanoate liquid fungicide (15ml/4L water) every 7-10 days.</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                  <span className="text-xs font-semibold text-blue-700 uppercase">Targeted Chemical</span>
                  <p className="text-xs text-blue-950 font-medium">Chlorothalonil 720 SC at 2.0ml/L. Observe strict 7-day Pre-Harvest Interval.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Architected for Agriculture</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">End-to-End Multimodal Diagnostic Pipeline</h2>
          <p className="text-sm text-slate-500 mt-2">Engineered from the ground up for agronomists, field workers, and commercial growers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Multimodal Foliar Capture</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload plant foliage photos with contextual field factors: growth stage, soil type, irrigation system, and regional weather.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. Gemini 2.5 Flash Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Processes symptoms through server-side GenAI SDK with strict JSON schema constraints for guaranteed structured outputs.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Actionable Farm Remediation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Receive balanced organic and chemical dosage plans, PPE warnings, printable reports, and an interactive task checklist.
            </p>
          </div>
        </div>
      </section>

      {/* Target Domains Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Broad Botanical Coverage</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Calibrated Across Cereals, Legumes, Vegetables & Orchard Fruits
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              From Early Blight on Solanaceae to Fusarium wilt in cereals and powdery mildews in orchards, AgriAdviser Pro provides scientifically rigorous, safe interventions.
            </p>
            <div className="pt-2">
              <Link
                to={user ? "/advisory/new" : "/signup"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md transition-colors"
              >
                <span>Run Crop Diagnostic Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

