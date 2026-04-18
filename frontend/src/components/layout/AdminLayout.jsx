import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    LayoutDashboard,
    Users,
    UtensilsCrossed,
    Grid3X3,
    BarChart3,
    LogOut,
    Menu,
    X,
    Package
} from 'lucide-react'

export function AdminLayout() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
        { path: '/admin/reservations', label: 'Reservations', icon: Grid3X3 },
        { path: '/admin/staff', label: 'Staff', icon: Users },
        { path: '/admin/inventory', label: 'Inventory', icon: Package },
        // { path: '/admin/reports', label: 'Reports', icon: BarChart3 }, // Integrated in Dashboard for now
    ]

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 glass-dark transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-800">
                        <Link to="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <UtensilsCrossed className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-display font-bold text-white">Savoria Admin</span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-secondary-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User */}
                    <div className="p-4 border-t border-secondary-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                                <span className="text-primary-400 font-medium">
                                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{user?.full_name}</p>
                                <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="nav-link w-full text-red-400 hover:bg-red-500/10"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 glass-dark flex items-center justify-between px-4">
                    <button onClick={() => setSidebarOpen(true)} className="text-secondary-400">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-display font-bold text-white">Admin</span>
                    <div className="w-6" />
                </header>

                {/* Content */}
                <div className="flex-1 p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default AdminLayout
