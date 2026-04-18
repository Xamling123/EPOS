import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    Home,
    Calendar,
    UtensilsCrossed,
    ClipboardList,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
    const { user, logout, isAuthenticated } = useAuth()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isActive = (path) => location.pathname === path

    const publicLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/menu', label: 'Menu', icon: UtensilsCrossed },
        { path: '/reservations', label: 'Reserve', icon: Calendar },
    ]

    const customerLinks = [
        { path: '/dashboard', label: 'My Reservations', icon: ClipboardList },
    ]

    return (
        <nav className="glass-dark sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <UtensilsCrossed className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-display text-xl font-bold text-white hidden sm:block">
                            EPOS
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {publicLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${isActive(link.path)
                                        ? 'bg-primary-500/20 text-primary-400'
                                        : 'text-secondary-400 hover:text-white hover:bg-secondary-800'
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        ))}

                        {isAuthenticated && user?.role === 'customer' && customerLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${isActive(link.path)
                                        ? 'bg-primary-500/20 text-primary-400'
                                        : 'text-secondary-400 hover:text-white hover:bg-secondary-800'
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={user?.role === 'customer' ? '/dashboard' : `/${user?.role === 'chef' ? 'kitchen' : user?.role}`}
                                    className="flex items-center gap-2 text-secondary-400 hover:text-white transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span>{user?.full_name || user?.email}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="btn-ghost flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-secondary-400 hover:text-white"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-secondary-800 animate-slide-down">
                        <div className="flex flex-col gap-2">
                            {publicLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg
                    ${isActive(link.path)
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : 'text-secondary-400 hover:text-white hover:bg-secondary-800'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <>
                                    {user?.role === 'customer' && customerLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg
                        ${isActive(link.path)
                                                    ? 'bg-primary-500/20 text-primary-400'
                                                    : 'text-secondary-400 hover:text-white hover:bg-secondary-800'
                                                }`}
                                        >
                                            <link.icon className="w-5 h-5" />
                                            {link.label}
                                        </Link>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false)
                                            logout()
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary-400 hover:text-white hover:bg-secondary-800"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-2 pt-2">
                                    <Link to="/login" className="btn-secondary flex-1 text-center">
                                        Login
                                    </Link>
                                    <Link to="/register" className="btn-primary flex-1 text-center">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
