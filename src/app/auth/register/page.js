import RegisterHeader from '@/components/auth/register/RegisterHeader'
import RegisterForm from '@/components/auth/register/RegisterForm'

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-2xl w-full space-y-8">
        <RegisterHeader />
        <RegisterForm />
      </div>
    </div>
  )
}

export default Register