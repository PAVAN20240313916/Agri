import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdvisories, deleteAdvisory } from '../services/api';
import DashboardStats from '../components/DashboardStats';
import AdvisoryCard from '../components/AdvisoryCard';
import { 
  PlusCircle, 
  History, 
  Sprout, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  const { user, session } = useAuth();
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdvisories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdvisories(session?.access_token);
      setAdvisories(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load advisories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisories();
  }, [session?.access_token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advisory report?')) return;
    try {
      await deleteAdvisory(id, session?.access_token);
      setAdvisories(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete advisory');
    }
  };

  const recentAdvisories = advisories.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Farm Diagnostics Overview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Real-time Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user?.fullName || 'Lead Agronomist'}
          </h1>
          <p className="text-xs text-slate-500">
            {user?.farmLocation ? `📍 Monitored Location: ${user.farmLocation}` : 'Agricultural Management Console'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdvisories}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Diagnostics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/advisory/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Crop Advisory</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Component */}
      <DashboardStats advisories={advisories} />

      {/* Recent Advisories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Crop Advisories</h2>
            <p className="text-xs text-slate-500">Latest pathological and nutritional reports generated for your crops</p>
          </div>

          {advisories.length > 4 && (
            <Link
              to="/history"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>View All ({advisories.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Loading / Error / Empty / Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
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
            <h3 className="text-base font-bold text-rose-900">Failed to Load Advisories</h3>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={fetchAdvisories}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : recentAdvisories.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Crop Advisories Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Start by running a diagnostic wizard on your crop. Upload foliage images to detect fungal, bacterial, viral, or nutrient stresses.
            </p>
            <Link
              to="/advisory/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Create First Advisory
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAdvisories.map((advisory) => (
              <AdvisoryCard
                key={advisory.id}
                advisory={advisory}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

