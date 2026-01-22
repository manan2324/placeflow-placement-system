import LoginHeader from '@/components/auth/login/LoginHeader'
import LoginForm from '@/components/auth/login/LoginForm'

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full space-y-8 animate-slide-up">
        <LoginHeader />
        <LoginForm />
      </div>
    </div>
  )
}

export default Login