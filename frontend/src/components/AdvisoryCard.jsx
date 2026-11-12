import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle, 
  Trash2, 
  Layers, 
  Droplet 
} from 'lucide-react';

export const SEVERITY_CONFIG = {
  Low: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Low Severity'
  },
  Moderate: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Moderate Severity'
  },
  Severe: {
    bg: 'bg-orange-50 text-orange-800 border-orange-200',
    dot: 'bg-orange-500',
    label: 'Severe Risk'
  },
  Critical: {
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    dot: 'bg-rose-600',
    label: 'Critical Hazard'
  }
};

export default function AdvisoryCard({ advisory, onDelete }) {
  const diagnosis = advisory.ai_diagnosis || {};
  const severityKey = diagnosis.severity || 'Moderate';
  const severity = SEVERITY_CONFIG[severityKey] || SEVERITY_CONFIG.Moderate;
  const dateFormatted = new Date(advisory.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Fallback crop thumbnail if none was uploaded
  const displayImage = advisory.image_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Top Banner / Image Section */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={displayImage}
          alt={advisory.crop_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-black/20" />

        {/* Severity Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-sm ${severity.bg}`}>
            <span className={`w-2 h-2 rounded-full ${severity.dot}`} />
            {severityKey}
          </span>
        </div>

        {/* Confidence Score */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 backdrop-blur-md shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {diagnosis.confidenceScore || 92}% Match
          </span>
        </div>

        {/* Bottom overlay: Crop name & Stage */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h4 className="text-base font-bold truncate drop-shadow-sm">{advisory.crop_name}</h4>
          <div className="flex items-center gap-2 text-xs text-slate-200 mt-0.5">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-300" />
              {advisory.growth_stage} Stage
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Droplet className="w-3 h-3 text-blue-300" />
              {advisory.irrigation_type}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Diagnosis Title */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {diagnosis.diagnosisTitle || 'Agronomic Pathology Assessment'}
          </h3>

          {/* Primary Cause */}
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {diagnosis.primaryCause || advisory.symptoms_description}
          </p>
        </div>

        {/* Footer & Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {dateFormatted}
          </span>

          <div className="flex items-center gap-1.5">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(advisory.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Advisory"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <Link
              to={`/advisory/${advisory.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>View Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

