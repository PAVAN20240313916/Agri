import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdvisories, deleteAdvisory } from '../services/api';
import AdvisoryCard from '../components/AdvisoryCard';
import { 
  History, 
  Search, 
  Filter, 
  PlusCircle, 
  RefreshCw, 
  LayoutGrid, 
  List, 
  AlertCircle, 
  Sprout, 
  Calendar,
  Layers
} from 'lucide-react';

const CROP_CATEGORIES = [
  { label: 'All Crops', value: 'all' },
  { label: 'Vegetables', value: 'vegetables', matches: ['tomato', 'potato', 'onion', 'pepper'] },
  { label: 'Cereals & Grains', value: 'cereals', matches: ['wheat', 'rice', 'corn', 'maize', 'barley'] },
  { label: 'Fruits & Orchards', value: 'fruits', matches: ['apple', 'citrus', 'orange', 'lemon', 'banana'] },
  { label: 'Legumes', value: 'legumes', matches: ['soybean', 'lentil', 'bean', 'pea'] },
];

const SEVERITY_OPTIONS = ['all', 'Low', 'Moderate', 'Severe', 'Critical'];

export default function HistoryPage() {
  const { session } = useAuth();
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const fetchAdvisories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdvisories(session?.access_token);
      setAdvisories(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch advisories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisories();
  }, [session?.access_token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this historical record?')) return;
    try {
      await deleteAdvisory(id, session?.access_token);
      setAdvisories(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  // Filter logic
  const filteredAdvisories = advisories.filter((advisory) => {
    const crop = (advisory.crop_name || '').toLowerCase();
    const title = (advisory.ai_diagnosis?.diagnosisTitle || '').toLowerCase();
    const cause = (advisory.ai_diagnosis?.primaryCause || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    // Search query match
    if (search && !crop.includes(search) && !title.includes(search) && !cause.includes(search)) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const categoryObj = CROP_CATEGORIES.find(c => c.value === selectedCategory);
      if (categoryObj?.matches) {
        const matchesCat = categoryObj.matches.some(m => crop.includes(m));
        if (!matchesCat) return false;
      }
    }

    // Severity filter
    if (selectedSeverity !== 'all') {
      const sev = advisory.ai_diagnosis?.severity;
      if (sev !== selectedSeverity) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Historical Database</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Archived Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Crop Advisory Archive
          </h1>
          <p className="text-xs text-slate-500">
            Search, filter, and review historical farm pathology evaluations and treatment progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdvisories}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/advisory/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Advisory</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by crop, disease title, or pathogen keyword..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {SEVERITY_OPTIONS.map((sev) => (
                <option key={sev} value={sev}>
                  {sev === 'all' ? 'All Severities' : `${sev} Severity`}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Crop Domain:
          </span>
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advisory Cards Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 h-80 p-6 animate-pulse space-y-4">
              <div className="h-40 bg-slate-100 rounded-xl" />
              <div className="h-5 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 rounded-2xl border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">Failed to Load Records</h3>
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      ) : filteredAdvisories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Matching Advisories Found</h3>
          <p className="text-xs text-slate-500">
            {searchTerm || selectedCategory !== 'all' || selectedSeverity !== 'all'
              ? 'Try adjusting your search criteria or resetting the category filters.'
              : 'You have not generated any crop advisories yet.'}
          </p>
          {(searchTerm || selectedCategory !== 'all' || selectedSeverity !== 'all') ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedSeverity('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Reset All Filters
            </button>
          ) : (
            <Link
              to="/advisory/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Start New Diagnostic
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvisories.map((advisory) => (
            <AdvisoryCard
              key={advisory.id}
              advisory={advisory}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {filteredAdvisories.map((advisory) => {
            const diagnosis = advisory.ai_diagnosis || {};
            return (
              <div key={advisory.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={advisory.image_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=200&q=80'}
                      alt={advisory.crop_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{advisory.crop_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {advisory.growth_stage}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-emerald-800 mt-0.5">
                      {diagnosis.diagnosisTitle || 'Diagnostic Assessment'}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xl mt-0.5">
                      {diagnosis.primaryCause || advisory.symptoms_description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-semibold text-slate-700 block">
                      {diagnosis.confidenceScore || 90}% Match
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(advisory.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/advisory/${advisory.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors"
                  >
                    View Report
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

