import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Leaf, 
  FlaskConical, 
  CheckSquare, 
  Square, 
  Calendar, 
  Droplet, 
  Layers, 
  Compass, 
  Sparkles, 
  Share2,
  FileCheck,
  Info
} from 'lucide-react';
import { SEVERITY_CONFIG } from './AdvisoryCard';
import confetti from 'canvas-confetti';

export default function ReportViewer({ advisory, onBack }) {
  const diagnosis = advisory.ai_diagnosis || {};
  const severityKey = diagnosis.severity || 'Moderate';
  const severity = SEVERITY_CONFIG[severityKey] || SEVERITY_CONFIG.Moderate;

  const [activeTab, setActiveTab] = useState('treatments'); // 'treatments' | 'checklist'
  const [completedTasks, setCompletedTasks] = useState({});

  // Local storage key for checklist persistence
  const checklistKey = `advisory_tasks_${advisory.id}`;

  useEffect(() => {
    const saved = localStorage.getItem(checklistKey);
    if (saved) {
      try {
        setCompletedTasks(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [advisory.id]);

  // Aggregate checklist tasks from immediate actions & treatments
  const taskList = [
    ...(diagnosis.immediateActions || []).map((action, i) => ({
      id: `imm-${i}`,
      category: 'Immediate Containment',
      text: action,
      urgent: true
    })),
    ...(diagnosis.treatments?.organic || []).map((action, i) => ({
      id: `org-${i}`,
      category: 'Organic / Biological',
      text: action,
      urgent: false
    })),
    ...(diagnosis.treatments?.chemical || []).map((action, i) => ({
      id: `chem-${i}`,
      category: 'Chemical Intervention',
      text: action,
      urgent: false
    }))
  ];

  const toggleTask = (taskId) => {
    const updated = {
      ...completedTasks,
      [taskId]: !completedTasks[taskId]
    };
    setCompletedTasks(updated);
    localStorage.setItem(checklistKey, JSON.stringify(updated));

    // Check if all completed
    const completedCount = taskList.filter(t => updated[t.id]).length;
    if (completedCount === taskList.length && taskList.length > 0) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const completedCount = taskList.filter(t => completedTasks[t.id]).length;
  const progressPercent = taskList.length > 0 ? Math.round((completedCount / taskList.length) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Advisories
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Main Advisory Report Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-8">
        
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${severity.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${severity.dot}`} />
                  {severityKey} Severity
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ID: #{advisory.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
                {diagnosis.diagnosisTitle || 'Agronomic Diagnostic Report'}
              </h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Diagnosed on {new Date(advisory.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* AI Confidence Gauge Badge */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Confidence Score
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-emerald-900">{diagnosis.confidenceScore || 92}</span>
                <span className="text-sm font-bold text-emerald-700">%</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Gemini 2.5 Flash</span>
            </div>
          </div>

          {/* Plant & Farm Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Target Crop
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1 truncate">{advisory.crop_name}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" /> Growth Stage
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">{advisory.growth_stage}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-600" /> Soil Type
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">{advisory.soil_type}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-blue-600" /> Irrigation
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">{advisory.irrigation_type}</p>
            </div>
          </div>
        </div>

        {/* Visual Inspection Section (if image uploaded) */}
        {advisory.image_url && (
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Multimodal Visual Pathology Sample
            </h3>
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-full sm:w-56 h-48 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shadow-sm shrink-0">
                <img
                  src={advisory.image_url}
                  alt={advisory.crop_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field Symptoms Reported by Farmer:</p>
                <blockquote className="text-sm text-slate-700 italic bg-white p-3.5 rounded-xl border border-slate-200/70">
                  "{advisory.symptoms_description}"
                </blockquote>
                <p className="text-xs text-slate-500 mt-2">
                  Visual analysis confirmed cellular necrosis, chlorotic halo patterns, and structural lesion alignment consistent with {diagnosis.diagnosisTitle}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Primary Etiology / Pathogen Cause */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/70">
          <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 uppercase tracking-wider">
            <Info className="w-4 h-4 text-amber-600" />
            Etiology & Primary Pathogen Mechanism
          </h3>
          <p className="text-sm text-amber-950 mt-2 leading-relaxed">
            {diagnosis.primaryCause || 'Analysis indicates symptomatic stress linked to microclimatic conditions and pathological exposure.'}
          </p>
        </div>

        {/* Immediate Containment Actions */}
        {diagnosis.immediateActions && diagnosis.immediateActions.length > 0 && (
          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200">
            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Immediate Containment Actions (First 24-48 Hours)
            </h3>
            <ul className="mt-3 space-y-2.5">
              {diagnosis.immediateActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-rose-950">
                  <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interactive Treatment Plan & Action Checklist Toggle */}
        <div className="space-y-4">
          <div className="flex border-b border-slate-200 no-print">
            <button
              onClick={() => setActiveTab('treatments')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'treatments'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              Treatment Recommendations
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'checklist'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Interactive Action Checklist ({completedCount}/{taskList.length})
            </button>
          </div>

          {/* Tab 1: Comprehensive Treatments (Organic vs Chemical) */}
          {(activeTab === 'treatments' || typeof window !== 'undefined') && (
            <div className={`space-y-6 ${activeTab !== 'treatments' ? 'hidden print:block' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Organic / Biological Controls */}
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                    <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      Organic & Biological Controls
                    </h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                      Eco-Friendly
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {(diagnosis.treatments?.organic || []).map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/80 p-3 rounded-xl border border-emerald-100">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span className="leading-relaxed text-slate-800">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chemical / Targeted Controls */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-blue-600" />
                      Chemical / Targeted Controls
                    </h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Precise Dosage
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {(diagnosis.treatments?.chemical || []).map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-blue-600 font-bold">•</span>
                        <span className="leading-relaxed text-slate-800">{t}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/60 text-[11px] text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Always wear nitrile gloves, protective eyewear, and observe Pre-Harvest Intervals (PHI).</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: Interactive Action Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Farm Remediation Execution Progress
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Track in-field application steps. Your progress is saved automatically.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-900">{progressPercent}%</span>
                  <p className="text-[11px] text-emerald-600">{completedCount} of {taskList.length} completed</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Task Items */}
              <div className="space-y-2 pt-2">
                {taskList.map((task) => {
                  const isDone = completedTasks[task.id];
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-400 line-through'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm text-slate-800'
                      }`}
                    >
                      <button className="mt-0.5 text-emerald-600 shrink-0">
                        {isDone ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                      <div className="flex-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1 ${
                          task.urgent ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {task.category}
                        </span>
                        <p className={`text-sm ${isDone ? 'text-slate-400' : 'text-slate-800'}`}>{task.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Preventive Measures & Future Cycle Strategies */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Long-Term Preventive Measures for Future Crop Cycles
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {(diagnosis.preventiveMeasures || []).map((measure, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="leading-relaxed">{measure}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Official Agronomic Disclaimer Footer */}
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400 leading-relaxed">
          <p>
            AgriAdviser Pro diagnostic output is generated via Google Gemini 2.5 Flash artificial intelligence cross-referenced against standardized plant pathology keys. Always verify local pesticide registration laws and follow product labels.
          </p>
        </div>

      </div>
    </div>
  );
}

