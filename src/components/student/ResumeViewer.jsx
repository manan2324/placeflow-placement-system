/**
 * Resume Viewer Component
 * Handles secure viewing of resumes stored in Cloudinary or local storage
 */
"use client";
import { useState, useEffect } from 'react';
import { getResumeUrl } from '@/services/student.api';
import { Loader2, AlertCircle, Eye } from 'lucide-react';

export default function ResumeViewer({ resumeId, className = "" }) {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResumeUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  const fetchResumeUrl = async () => {
    if (!resumeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Check if it's a local URL (starts with /)
      if (resumeId.startsWith('/')) {
        setResumeUrl(resumeId);
        setLoading(false);
        return;
      }
      
      // Fetch secure signed URL from Cloudinary
      const response = await getResumeUrl(resumeId);
      setResumeUrl(response.data.url);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to fetch resume URL:', err);
      }
      setError('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed ${className}`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </button>
    );
  }

  if (error || !resumeUrl) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-not-allowed bg-red-100 text-red-600 ${className}`}
      >
        <AlertCircle className="w-5 h-5" />
        Unavailable
      </button>
    );
  }

  return (
    <button
      onClick={handleView}
      className={className || "inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"}
    >
      <Eye className="w-5 h-5" />
      View Resume
    </button>
  );
}
