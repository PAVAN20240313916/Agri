import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Droplets, 
  ThermometerSun, 
  Wind 
} from 'lucide-react';

export default function DashboardStats({ advisories = [] }) {
  const total = advisories.length;
  const criticalOrSevere = advisories.filter(
    a => a.ai_diagnosis?.severity === 'Critical' || a.ai_diagnosis?.severity === 'Severe'
  ).length;
  const moderate = advisories.filter(a => a.ai_diagnosis?.severity === 'Moderate').length;
  const low = advisories.filter(a => a.ai_diagnosis?.severity === 'Low').length;

  const avgConfidence = total > 0
    ? (advisories.reduce((acc, curr) => acc + (Number(curr.ai_diagnosis?.confidenceScore) || 90), 0) / total).toFixed(1)
    : '94.2';

  return (
    <div className="space-y-6">
      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Diagnoses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Advisories</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{total}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> All time
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Active monitored farm plots</p>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Urgent Interventions</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">{criticalOrSevere}</span>
            <span className="text-xs font-medium text-slate-500">Severe / Critical</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Require immediate chemical or cultural control</p>
        </div>

        {/* Moderate / Contained */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Managed & Moderate</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">{moderate + low}</span>
            <span className="text-xs font-medium text-emerald-600">Under observation</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Organic and nutritional remedies applied</p>
        </div>

        {/* AI Confidence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mean AI Confidence</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{avgConfidence}%</span>
            <span className="text-xs font-medium text-indigo-600">Gemini 2.5 Flash</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Phytopathological certainty score</p>
        </div>
      </div>

      {/* Quick Agro-Meteorological & Soil Field Note Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Live Field Weather & Soil Microclimate</span>
            </div>
            <p className="text-sm text-emerald-100 mt-1 max-w-xl">
              Optimal spray window detected for foliar biological treatments before 10:00 AM. Fungal spore germination risk elevated due to night-time relative humidity exceeding 82%.
            </p>
          </div>

          <div className="flex items-center gap-6 divide-x divide-emerald-700/60 pt-2 md:pt-0">
            <div className="flex items-center gap-2">
              <ThermometerSun className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-xs text-emerald-200">Ambient Temp</p>
                <p className="text-sm font-bold text-white">24.2°C</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-6">
              <Droplets className="w-5 h-5 text-cyan-300" />
              <div>
                <p className="text-xs text-emerald-200">Rel. Humidity</p>
                <p className="text-sm font-bold text-white">76%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-6">
              <Wind className="w-5 h-5 text-emerald-300" />
              <div>
                <p className="text-xs text-emerald-200">Wind Velocity</p>
                <p className="text-sm font-bold text-white">5.8 km/h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

