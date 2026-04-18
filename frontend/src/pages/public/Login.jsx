import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Input } from '../../components/common/UI'
import { UtensilsCrossed, Mail, Lock, AlertCircle } from 'lucide-react'

export function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/dashboard'

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await login(formData.email, formData.password)

        setLoading(false)

        if (result.success) {
            // Redirect based on role
            const user = result.user
            console.log('Login successful, user role:', user.role)
            if (user.role === 'admin') navigate('/admin')
            else if (user.role === 'waiter') navigate('/waiter')
            else if (user.role === 'chef') navigate('/kitchen')
            else if (user.role === 'cashier') navigate('/cashier')
            else navigate(from)
        } else {
            console.error('Login failed:', result.error)
            setError(result.error || 'Invalid email or password')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/20" />

            <div className="card max-w-md w-full relative z-10 animate-scale-in">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <UtensilsCrossed className="w-7 h-7 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-secondary-400">
                        Sign in to your account to continue
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="input pl-12"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="input pl-12"
                        />
                    </div>

                    <Button type="submit" loading={loading} className="w-full">
                        Sign In
                    </Button>
                </form>

                <p className="text-center text-secondary-400 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                        Sign up
                    </Link>
                </p>

                {/* Demo Accounts section removed for production */}
            </div>
        </div>
    )
}

export default Login
