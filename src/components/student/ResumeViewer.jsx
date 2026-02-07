/**
 * Resume Viewer Component
 * Handles secure viewing of resumes stored in Cloudinary or local storage
 */
"use client";
import { useState, useEffect } from 'react';
import { getResumeUrl } from '@/services/student.api';

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
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
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
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Unavailable
      </button>
    );
  }

  return (
    <button
      onClick={handleView}
      className={className || "inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      View Resume
    </button>
  );
}
