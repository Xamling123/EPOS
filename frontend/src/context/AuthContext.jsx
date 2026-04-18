import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Check for existing auth on mount
        const token = localStorage.getItem('access_token')
        const storedUser = localStorage.getItem('user')

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('user')
            }
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            setError(null)
            const response = await authAPI.login(email, password)
            console.log('Login response:', response.data)
            
            const { access, refresh, user: userData } = response.data

            localStorage.setItem('access_token', access)
            localStorage.setItem('refresh_token', refresh)
            localStorage.setItem('user', JSON.stringify(userData))

            setUser(userData)
            return { success: true, user: userData }
        } catch (err) {
            // Handle different error response formats
            let message = 'Login failed'
            
            console.log('Login error details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
            })
            
            if (err.response?.data) {
                const data = err.response.data
                // Handle DRF error format (detail or non_field_errors)
                if (data.detail) {
                    message = data.detail
                } else if (data.non_field_errors) {
                    message = Array.isArray(data.non_field_errors) 
                        ? data.non_field_errors[0] 
                        : data.non_field_errors
                } else if (data.error?.message) {
                    // Custom error format
                    message = data.error.message
                } else if (data.message) {
                    message = data.message
                } else if (typeof data === 'string') {
                    message = data
                }
            } else if (err.message) {
                message = err.message
            }
            
            console.log('Login error message:', message)
            setError(message)
            return { success: false, error: message }
        }
    }

    const register = async (userData) => {
        try {
            setError(null)
            const response = await authAPI.register(userData)
            const { tokens, user: newUser } = response.data

            localStorage.setItem('access_token', tokens.access)
            localStorage.setItem('refresh_token', tokens.refresh)
            localStorage.setItem('user', JSON.stringify(newUser))

            setUser(newUser)
            return { success: true, user: newUser }
        } catch (err) {
            // Handle different error response formats
            let message = 'Registration failed'
            
            if (err.response?.data) {
                const data = err.response.data
                // Handle DRF validation errors (field-specific)
                if (typeof data === 'object' && !Array.isArray(data)) {
                    // Look for field errors
                    for (const [field, errors] of Object.entries(data)) {
                        if (Array.isArray(errors)) {
                            message = `${field}: ${errors[0]}`
                            break
                        } else if (typeof errors === 'string') {
                            message = `${field}: ${errors}`
                            break
                        }
                    }
                } else if (data.detail) {
                    message = data.detail
                } else if (data.message) {
                    message = data.message
                } else if (typeof data === 'string') {
                    message = data
                }
            } else if (err.message) {
                message = err.message
            }
            
            setError(message)
            return { success: false, error: message }
        }
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const updateProfile = async (data) => {
        try {
            const response = await authAPI.updateProfile(data)
            const updatedUser = { ...user, ...response.data }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setUser(updatedUser)
            return { success: true }
        } catch (err) {
            return { success: false, error: err.response?.data?.error?.message }
        }
    }

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        // Role checks
        isAdmin: user?.role === 'admin',
        isWaiter: user?.role === 'waiter' || user?.role === 'admin',
        isChef: user?.role === 'chef' || user?.role === 'admin',
        isCashier: user?.role === 'cashier' || user?.role === 'admin',
        isCustomer: user?.role === 'customer',
        isStaff: ['admin', 'waiter', 'chef', 'cashier'].includes(user?.role),
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
