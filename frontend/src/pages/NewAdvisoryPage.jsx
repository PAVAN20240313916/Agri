import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createAdvisory } from '../services/api';
import AdvisoryForm from '../components/AdvisoryForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Sprout, 
  Lightbulb, 
  ShieldCheck, 
  Camera, 
  AlertCircle, 
  Check 
} from 'lucide-react';

export default function NewAdvisoryPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await createAdvisory(formData, session?.access_token);
      if (response && response.data) {
        navigate(`/advisory/${response.data.id}`);
      } else {
        throw new Error('Invalid response received from advisory engine.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to process crop advisory diagnostic.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Loading Modal Overlay */}
      {loading && <LoadingSpinner />}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sprout className="w-3.5 h-3.5" />
          <span>Multimodal Diagnostic Wizard</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          New Crop Advisory & Visual Diagnosis
        </h1>
        <p className="text-xs text-slate-500">
          Complete the 3-step field parameters and plant photograph to receive an instant AI-powered treatment plan.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="max-w-3xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Diagnostic Request Failed:</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Form + Tips Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        
        {/* Left Form (takes 3 cols on large screens) */}
        <div className="lg:col-span-3">
          <AdvisoryForm onSubmit={handleFormSubmit} loading={loading} />
        </div>

        {/* Right Sidebar: Expert Field Tips */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <Camera className="w-4 h-4 text-emerald-600" />
              Photography Guide
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span>Focus sharply on the transition boundary between healthy green and diseased tissue.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span>Photograph both upper and lower leaf surfaces if fungal spores or aphids are present.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span>Avoid heavy glare or direct midday sunlight; morning diffused daylight produces highest diagnostic accuracy.</span>
              </li>
            </ul>
          </div>

          <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200/80 p-6 space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Scientific Rigor Guarantee
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Every advisory is synthesized via Gemini 2.5 Flash, cross-checked against standard phytopathological literature to prioritize organic biocontrols and chemical safety.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

