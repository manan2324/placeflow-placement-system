"use client";

export default function LoginHeader() {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-bounce-soft">
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="mt-6 text-3xl font-bold text-gray-900 animate-fade-in-delay-1">Welcome Back</h2>
      <p className="mt-2 text-sm text-gray-600 animate-fade-in-delay-2">Sign in to your placement portal</p>
    </div>
  );
}
