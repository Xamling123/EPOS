import { useState, useEffect } from 'react'
import { ordersAPI } from '../../api/orders'
import { paymentsAPI } from '../../api/payments'
import { Card, Badge, Loading } from '../../components/common/UI'
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
    BarChart3,
    Clock
} from 'lucide-react'

export function AdminDashboard() {
    const [reports, setReports] = useState(null)
    const [paymentSummary, setPaymentSummary] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const [ordersRes, paymentsRes] = await Promise.all([
                ordersAPI.getReports(),
                paymentsAPI.getSummary()
            ])
            setReports(ordersRes.data.reports)
            setPaymentSummary(paymentsRes.data.summary)
        } catch (err) {
            console.error('Failed to fetch reports:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loading size="lg" />
            </div>
        )
    }

    const dailySales = reports?.daily_sales || {}
    const popularItems = reports?.popular_items || []
    const ordersByStatus = reports?.orders_by_status || []

    return (
        <div>
            <h1 className="text-3xl font-display font-bold text-white mb-8">
                Dashboard
            </h1>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-card-label">Today's Revenue</span>
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                    </div>
                    <p className="stat-card-value text-green-400">
                        Rs.{dailySales.total_revenue || '0'}
                    </p>
                </Card>

                <Card className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-card-label">Today's Orders</span>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                    <p className="stat-card-value text-blue-400">
                        {dailySales.order_count || 0}
                    </p>
                </Card>

                <Card className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-card-label">Today's Payments</span>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                    <p className="stat-card-value text-purple-400">
                        {paymentSummary?.today?.count || 0}
                    </p>
                </Card>

                <Card className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-card-label">Active Orders</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                    </div>
                    <p className="stat-card-value text-amber-400">
                        {ordersByStatus.find(s => s.status === 'pending')?.count || 0}
                    </p>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Popular Items */}
                <Card>
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-400" />
                        Popular Items
                    </h2>
                    <div className="space-y-3">
                        {popularItems.length > 0 ? (
                            popularItems.slice(0, 5).map((item, index) => (
                                <div key={item.item_name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-secondary-800 flex items-center justify-center text-xs text-secondary-400">
                                            {index + 1}
                                        </span>
                                        <span className="text-white">{item.item_name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-secondary-400">{item.count} orders</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-secondary-400 text-center py-4">No order data yet</p>
                        )}
                    </div>
                </Card>

                {/* Orders by Status */}
                <Card>
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary-400" />
                        Orders by Status
                    </h2>
                    <div className="space-y-3">
                        {ordersByStatus.map((status) => (
                            <div key={status.status} className="flex items-center justify-between">
                                <Badge variant={
                                    status.status === 'closed' ? 'success' :
                                        status.status === 'pending' ? 'warning' :
                                            'info'
                                }>
                                    {status.status}
                                </Badge>
                                <span className="text-2xl font-bold text-white">{status.count}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Payment Methods */}
                <Card>
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary-400" />
                        Payment Methods
                    </h2>
                    <div className="space-y-3">
                        {paymentSummary?.by_method?.map((method) => (
                            <div key={method.payment_method} className="flex items-center justify-between">
                                <span className="text-secondary-300 capitalize">{method.payment_method}</span>
                                <div className="text-right">
                                    <span className="text-white font-medium">{method.count} transactions</span>
                                    <p className="text-sm text-secondary-400">Rs.{method.total}</p>
                                </div>
                            </div>
                        )) || (
                                <p className="text-secondary-400 text-center py-4">No payment data yet</p>
                            )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default AdminDashboard
