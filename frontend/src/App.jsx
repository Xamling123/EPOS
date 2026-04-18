// ... existing imports
import { Routes, Route, Navigate, useParams } from 'react-router-dom'

import { ProtectedRoute, RoleGuard } from './components/guards/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public Pages
import Home from './pages/public/Home'
import Login from './pages/public/Login'
import Register from './pages/public/Register'

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard'
import MenuBrowse from './pages/customer/MenuBrowse'
import CreateReservation from './pages/customer/CreateReservation'

// Staff Pages
import KitchenDisplay from './pages/chef/KitchenDisplay'
import BillingScreen from './pages/cashier/BillingScreen'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import MenuManagement from './pages/admin/MenuManagement'
import ReservationManagement from './pages/admin/ReservationManagement'
import StaffManagement from './pages/admin/StaffManagement'
import InventoryManagement from './pages/admin/InventoryManagement'

// Waiter Pages
import TableMap from './pages/waiter/TableMap'
import ActiveOrders from './pages/waiter/ActiveOrders'
import OrderEntry from './pages/waiter/OrderEntry'

// Layouts
import WaiterLayout from './components/layout/WaiterLayout'

import { CartProvider } from './context/CartContext'
import { WebSocketProvider } from './context/WebSocketContext'

// Wrapper to convert path param to query param for MenuBrowse
const MenuBrowseWrapper = () => {
    const { reservationId } = useParams()
    return <Navigate to={`/menu?reservationId=${reservationId}`} replace />
}

function App() {
    return (
        <CartProvider>
            <WebSocketProvider>
                <Routes>
                    {/* Public Routes with Navbar/Footer */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/menu" element={<MenuBrowse />} />
                        <Route path="/reservations" element={<CreateReservation />} />
                        <Route
                            path="/pre-order/:reservationId"
                            element={<MenuBrowseWrapper />}
                        />
                    </Route>

                    {/* Auth Routes (no layout) */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Customer Protected Routes */}
                    <Route element={<MainLayout />}>
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <CustomerDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    {/* Chef/Kitchen Route */}
                    <Route
                        path="/kitchen"
                        element={
                            <RoleGuard allowedRoles={['admin', 'chef']}>
                                <KitchenDisplay />
                            </RoleGuard>
                        }
                    />

                    {/* Cashier Route */}
                    <Route
                        path="/cashier"
                        element={
                            <RoleGuard allowedRoles={['admin', 'cashier']}>
                                <BillingScreen />
                            </RoleGuard>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <RoleGuard allowedRoles={['admin']}>
                                <AdminLayout />
                            </RoleGuard>
                        }
                    >
                        <Route index element={<AdminDashboard />} />
                        <Route path="menu" element={<MenuManagement />} />
                        <Route path="reservations" element={<ReservationManagement />} />
                        <Route path="staff" element={<StaffManagement />} />
                        <Route path="inventory" element={<InventoryManagement />} />
                        {/* Add more admin routes here */}
                    </Route>

                    {/* Waiter Routes */}
                    <Route
                        path="/waiter"
                        element={
                            <RoleGuard allowedRoles={['admin', 'waiter']}>
                                <WaiterLayout />
                            </RoleGuard>
                        }
                    >
                        <Route index element={<TableMap />} />
                        <Route path="tables" element={<TableMap />} />
                        <Route path="orders" element={<ActiveOrders />} />
                        <Route path="order-entry/:tableId" element={<OrderEntry />} />
                    </Route>
                </Routes>
            </WebSocketProvider>
        </CartProvider>
    )
}

export default App
