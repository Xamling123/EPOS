import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/common/UI'
import { UtensilsCrossed, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react'

export function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        phone: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.password_confirm) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        const result = await register(formData)
        setLoading(false)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setError(result.error || 'Registration failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/20" />

            <div className="card max-w-md w-full relative z-10 animate-scale-in">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <UtensilsCrossed className="w-7 h-7 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-white mb-2">
                        Create an Account
                    </h1>
                    <p className="text-secondary-400">
                        Join us for an exceptional dining experience
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                className="input pl-12"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                className="input"
                            />
                        </div>
                    </div>

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
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone number (optional)"
                            value={formData.phone}
                            onChange={handleChange}
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
                            minLength={8}
                            className="input pl-12"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                        <input
                            type="password"
                            name="password_confirm"
                            placeholder="Confirm password"
                            value={formData.password_confirm}
                            onChange={handleChange}
                            required
                            className="input pl-12"
                        />
                    </div>

                    <Button type="submit" loading={loading} className="w-full">
                        Create Account
                    </Button>
                </form>

                <p className="text-center text-secondary-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register
