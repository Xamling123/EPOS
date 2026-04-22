import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWebSocket } from '../../context/WebSocketContext'
import { ordersAPI } from '../../api/orders'
import { handleApiError } from '../../api/errorHandler'
import { Card, Badge, Button, Loading } from '../../components/common/UI'
import { Clock, CheckCircle, RefreshCw, Edit2 } from 'lucide-react'

export default function ActiveOrders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [updating, setUpdating] = useState(null)

    const { lastMessage } = useWebSocket()

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        if (lastMessage && (lastMessage.type === 'order_update' || lastMessage.type === 'item_update')) {
            fetchOrders()
        }
    }, [lastMessage])

    const fetchOrders = async (isManual = false) => {
        if (isManual) setRefreshing(true)
        try {
            const response = await ordersAPI.getActive()
            setOrders(response.data.orders || [])
        } catch (err) {
            handleApiError('Fetch Active Orders', err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const markServed = async (orderId) => {
        if (!window.confirm('Mark this order as served?')) return
        setUpdating(orderId)
        try {
            await ordersAPI.updateStatus(orderId, 'served')
            fetchOrders()
        } catch (err) {
            const errorMsg = handleApiError('Mark as Served', err)
            alert(errorMsg || 'Failed to update status.')
        } finally {
            setUpdating(null)
        }
    }

    const confirmOrder = async (orderId) => {
        setUpdating(orderId)
        try {
            const response = await ordersAPI.updateStatus(orderId, 'confirmed')
            if (response.data && response.data.success) {
                setOrders(currentOrders =>
                    currentOrders.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o)
                )
            }
            fetchOrders()
        } catch (err) {
            const errorMsg = handleApiError('Confirm Order', err)
            alert(errorMsg || 'Error confirming order.')
        } finally {
            setUpdating(null)
        }
    }

    if (loading) return <Loading />

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Active Orders</h1>
                <Button
                    onClick={() => fetchOrders(true)}
                    variant="secondary"
                    loading={refreshing}
                >
                    <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(order => (
                    <Card key={order.id} className="flex flex-col">
                        <div className="flex justify-between items-start mb-4 pb-4 border-b border-secondary-800">
                            <button
                                onClick={() => navigate(`/waiter/orders/${order.id}`)}
                                className="text-left flex-1 hover:opacity-80 transition-opacity"
                            >
                                <h3 className="text-lg font-bold text-white">Order #{order.id}</h3>
                                <p className="text-secondary-400">Table {order.table_details?.table_number}</p>
                            </button>
                            <div className="text-right">
                                <Badge variant={order.status === 'ready' ? 'success' : 'warning'}>
                                    {order.status.toUpperCase()}
                                </Badge>
                                <p className="text-xs text-secondary-500 mt-1">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {new Date(order.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-2 mb-4">
                            <div className="text-sm text-secondary-400">
                                {order.items?.length || 0} items
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => navigate(`/waiter/orders/${order.id}`)}
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                View Details
                            </Button>

                            {order.status === 'pending' && (
                                <Button
                                    className="flex-1"
                                    onClick={() => confirmOrder(order.id)}
                                    loading={updating === order.id}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Confirm
                                </Button>
                            )}

                            {order.status === 'ready' && (
                                <Button
                                    className="flex-1"
                                    onClick={() => markServed(order.id)}
                                    loading={updating === order.id}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Served
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}

                {orders.length === 0 && (
                    <div className="col-span-full text-center py-20 text-secondary-400">
                        No active orders found.
                    </div>
                )}
            </div>
        </div>
    )
}
