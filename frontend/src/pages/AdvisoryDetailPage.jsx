import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdvisoryById } from '../services/api';
import ReportViewer from '../components/ReportViewer';
import { Sprout, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AdvisoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdvisory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdvisoryById(id, session?.access_token);
      setAdvisory(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load advisory report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory();
  }, [id, session?.access_token]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Loading comprehensive crop advisory #{id?.slice(0, 8)}...</p>
      </div>
    );
  }

  if (error || !advisory) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Advisory Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This report may have been deleted or does not exist.'}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/history')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to History
          </button>
          <button
            onClick={fetchAdvisory}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReportViewer advisory={advisory} onBack={() => navigate('/history')} />
    </div>
  );
}

