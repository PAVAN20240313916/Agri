import React, { useState } from 'react';
import { 
  Sprout, 
  Layers, 
  Compass, 
  Droplets, 
  Upload, 
  Image as ImageIcon, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Info,
  Camera
} from 'lucide-react';
import { advisoryInputSchema } from '../schemas/clientAdvisorySchema';

const POPULAR_CROPS = [
  'Tomato (Solanum lycopersicum)',
  'Wheat (Triticum aestivum)',
  'Rice (Oryza sativa)',
  'Corn / Maize (Zea mays)',
  'Potato (Solanum tuberosum)',
  'Apple (Malus domestica)',
  'Citrus (Orange / Lemon)',
  'Soybean (Glycine max)',
  'Onion (Allium cepa)',
  'Cotton (Gossypium hirsutum)'
];

const GROWTH_STAGES = ['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'];
const SOIL_TYPES = ['Sandy', 'Clay', 'Loamy', 'Silt', 'Peat'];
const IRRIGATION_TYPES = ['Drip', 'Sprinkler', 'Flood', 'Rainfed'];

// Sample images for 1-click test evaluation
const SAMPLE_PRESETS = [
  {
    title: 'Tomato Blight Leaf',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=800&q=80',
    crop: 'Tomato (Solanum lycopersicum)',
    stage: 'Flowering',
    soil: 'Loamy',
    irrigation: 'Drip',
    symptoms: 'Concentric dark brown circular spots with yellow chlorotic halos expanding on lower leaves.'
  },
  {
    title: 'Wheat Chlorosis Field',
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    crop: 'Wheat (Triticum aestivum)',
    stage: 'Vegetative',
    soil: 'Clay',
    irrigation: 'Flood',
    symptoms: 'General pale yellowing of bottom leaves, slow vegetative growth, and reduced tiller vigor.'
  },
  {
    title: 'Apple Scab Fruit/Leaf',
    url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80',
    crop: 'Apple (Malus domestica)',
    stage: 'Fruiting',
    soil: 'Loamy',
    irrigation: 'Sprinkler',
    symptoms: 'Olive green velvety lesions on foliage turning dark brown and corky on young fruit.'
  }
];

export default function AdvisoryForm({ onSubmit, loading }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    cropName: 'Tomato (Solanum lycopersicum)',
    growthStage: 'Flowering',
    soilType: 'Loamy',
    irrigationType: 'Drip',
    symptomsDescription: '',
    imageFile: null,
    imagePreview: null,
    presetImageUrl: null
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, imageFile: 'Please upload an image file (JPEG, PNG, WEBP)' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imageFile: 'Image file size must be under 5MB' }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      imageFile: file,
      imagePreview: previewUrl,
      presetImageUrl: null
    }));
    setErrors(prev => ({ ...prev, imageFile: null }));
  };

  const handleApplyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      cropName: preset.crop,
      growthStage: preset.stage,
      soilType: preset.soil,
      irrigationType: preset.irrigation,
      symptomsDescription: preset.symptoms,
      imageFile: null,
      imagePreview: preset.url,
      presetImageUrl: preset.url
    }));
    setErrors({});
  };

  const removeImage = () => {
    if (formData.imagePreview && !formData.presetImageUrl) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
      presetImageUrl: null
    }));
  };

  // Step Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.cropName || formData.cropName.trim().length < 2) {
        newErrors.cropName = 'Please select or enter a valid crop name';
      }
      if (!formData.growthStage) {
        newErrors.growthStage = 'Please select a growth stage';
      }
    } else if (step === 2) {
      if (!formData.soilType) {
        newErrors.soilType = 'Please select a soil type';
      }
      if (!formData.irrigationType) {
        newErrors.irrigationType = 'Please select an irrigation method';
      }
    } else if (step === 3) {
      if (!formData.symptomsDescription || formData.symptomsDescription.trim().length < 10) {
        newErrors.symptomsDescription = 'Please provide a detailed description of symptoms (at least 10 characters)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    // Build FormData payload for API
    const submissionData = new FormData();
    submissionData.append('cropName', formData.cropName);
    submissionData.append('growthStage', formData.growthStage);
    submissionData.append('soilType', formData.soilType);
    submissionData.append('irrigationType', formData.irrigationType);
    submissionData.append('symptomsDescription', formData.symptomsDescription);

    if (formData.imageFile) {
      submissionData.append('imageFile', formData.imageFile);
    } else if (formData.presetImageUrl) {
      submissionData.append('imageUrl', formData.presetImageUrl);
    }

    onSubmit(submissionData);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden max-w-3xl mx-auto">
      {/* Wizard Step Indicator Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep === 1
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : currentStep > 1
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-500'
            }`}>
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${currentStep === 1 ? 'text-emerald-900' : 'text-slate-500'}`}>
              Crop & Stage
            </span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 transition-colors ${currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep === 2
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : currentStep > 2
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-500'
            }`}>
              {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${currentStep === 2 ? 'text-emerald-900' : 'text-slate-500'}`}>
              Soil & Water
            </span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 transition-colors ${currentStep > 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep === 3
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-200 text-slate-500'
            }`}>
              '3'
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${currentStep === 3 ? 'text-emerald-900' : 'text-slate-500'}`}>
              Symptoms & Photo
            </span>
          </div>
        </div>
      </div>

      {/* Preset Quick Fill Bar */}
      <div className="bg-emerald-50/50 px-6 py-3 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-emerald-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Quick Test Presets (Instant 1-Click Load):
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-xs bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium transition-colors"
            >
              ⚡ {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        
        {/* STEP 1: CROP & GROWTH STAGE */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 1: Select Crop & Growth Stage</h2>
              <p className="text-xs text-slate-500 mt-1">Specify your plant species and where it is in its vegetative cycle.</p>
            </div>

            {/* Crop Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Crop Name / Botanical Variety
              </label>
              <input
                type="text"
                value={formData.cropName}
                onChange={(e) => handleChange('cropName', e.target.value)}
                placeholder="e.g. Tomato (Solanum lycopersicum)"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.cropName
                    ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                }`}
              />
              {errors.cropName && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.cropName}
                </p>
              )}

              {/* Quick Pills */}
              <div className="mt-3">
                <span className="text-[11px] text-slate-400 font-medium">Common agricultural crops:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {POPULAR_CROPS.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleChange('cropName', crop)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        formData.cropName === crop
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {crop.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Growth Stage */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Current Growth Stage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {GROWTH_STAGES.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => handleChange('growthStage', stage)}
                    className={`py-3 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      formData.growthStage === stage
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm ring-1 ring-emerald-600'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
              {errors.growthStage && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.growthStage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: SOIL & IRRIGATION */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 2: Soil & Irrigation Parameters</h2>
              <p className="text-xs text-slate-500 mt-1">
                Root dynamics and pathogen proliferation depend directly on soil structure and water delivery.
              </p>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Soil Classification
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {SOIL_TYPES.map((soil) => (
                  <button
                    key={soil}
                    type="button"
                    onClick={() => handleChange('soilType', soil)}
                    className={`py-3 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      formData.soilType === soil
                        ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-sm ring-1 ring-amber-600'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {soil}
                  </button>
                ))}
              </div>
              {errors.soilType && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.soilType}
                </p>
              )}
            </div>

            {/* Irrigation Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Irrigation System
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {IRRIGATION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleChange('irrigationType', type)}
                    className={`py-3 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      formData.irrigationType === type
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-1 ring-blue-600'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.irrigationType && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.irrigationType}
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SYMPTOMS & IMAGE UPLOAD */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 3: Symptom Description & Plant Photo</h2>
              <p className="text-xs text-slate-500 mt-1">
                Describe visible anomalies and attach an image for Gemini multimodal pathology inspection.
              </p>
            </div>

            {/* Symptoms Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Field Observations & Plant Symptoms
              </label>
              <textarea
                rows={4}
                value={formData.symptomsDescription}
                onChange={(e) => handleChange('symptomsDescription', e.target.value)}
                placeholder="Describe leaf spotting, discoloration, wilting, powder residue, stunted growth, or insect feeding..."
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.symptomsDescription
                    ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                }`}
              />
              <div className="flex justify-between items-center mt-1.5">
                {errors.symptomsDescription ? (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.symptomsDescription}
                  </p>
                ) : (
                  <span className="text-[11px] text-slate-400">Be as specific as possible (at least 10 characters).</span>
                )}
                <span className="text-[11px] text-slate-400 font-mono">
                  {formData.symptomsDescription.length} chars
                </span>
              </div>
            </div>

            {/* Image Upload Zone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Plant / Foliage Photograph (Optional but Highly Recommended)
              </label>

              {formData.imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 max-w-sm mx-auto group">
                  <img
                    src={formData.imagePreview}
                    alt="Plant preview"
                    className="w-full h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors shadow-md"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/60 text-white text-[11px] font-medium backdrop-blur-sm">
                    {formData.presetImageUrl ? 'Preset Sample Loaded' : 'Custom Image Ready'}
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all"
                  onClick={() => document.getElementById('crop-file-input').click()}
                >
                  <input
                    id="crop-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drag and drop plant photo
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    JPEG, PNG, or WEBP up to 5MB (High resolution leaf close-up recommended)
                  </p>
                </div>
              )}

              {errors.imageFile && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.imageFile}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Generate AI Diagnostic Advisory
            </button>
          )}
        </div>

      </form>
    </div>
  );
}

