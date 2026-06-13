import ForgotPasswordForm from '@/components/auth/forgot-password/ForgotPasswordForm'

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full space-y-8 animate-slide-up">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 animate-bounce-soft">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900 animate-fade-in-delay-1">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600 animate-fade-in-delay-2">We&apos;ll send a verification code to your email</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}

export default ForgotPassword
