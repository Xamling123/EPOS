import { useState, useEffect } from 'react'
import { useWebSocket } from '../../context/WebSocketContext'
import { ordersAPI } from '../../api/orders'
import { handleApiError } from '../../api/errorHandler'
import { Card, Badge, Button, Loading } from '../../components/common/UI'
import {
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCw
} from 'lucide-react'

export function KitchenDisplay() {
    const [orders, setOrders] = useState([])
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [updating, setUpdating] = useState(null)

    const { lastMessage } = useWebSocket()

    useEffect(() => {
        fetchKitchenOrders()
    }, [])

    useEffect(() => {
        if (lastMessage && (lastMessage.type === 'order_update' || lastMessage.type === 'item_update')) {
            fetchKitchenOrders()
        }
    }, [lastMessage])

    const fetchKitchenOrders = async (isManual = false) => {
        if (isManual) setRefreshing(true)
        try {
            const response = await ordersAPI.getKitchenOrders()
            // Backend sorts by priority, so we just trust the order
            setOrders(response.data.orders || [])
            setItems(response.data.items || [])
        } catch (err) {
            handleApiError('Fetch Kitchen Orders', err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const updateItemStatus = async (orderId, itemId, newStatus) => {
        setUpdating(itemId)
        try {
            await ordersAPI.updateItemStatus(orderId, itemId, newStatus)
            fetchKitchenOrders()
        } catch (err) {
            const errorMsg = handleApiError('Update Item Status', err)
            alert(errorMsg || 'Failed to update item status.')
        } finally {
            setUpdating(null)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-amber-400 bg-amber-500/20'
            case 'preparing': return 'text-blue-400 bg-blue-500/20'
            case 'ready': return 'text-green-400 bg-green-500/20'
            default: return 'text-secondary-400 bg-secondary-500/20'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'destructive'
            case 'low': return 'success'
            default: return 'secondary' // normal
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading size="lg" />
            </div>
        )
    }

    // Group items by order
    const orderGroups = orders.map(order => ({
        ...order,
        orderItems: items.filter(item => item.order === order.id)
    }))

    return (
        <div className="min-h-screen bg-secondary-950 p-4 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">
                        Kitchen Display
                    </h1>
                    <p className="text-secondary-400">
                        {items.length} items pending
                    </p>
                </div>
                <Button
                    onClick={() => fetchKitchenOrders(true)}
                    variant="secondary"
                    className="gap-2"
                    loading={refreshing}
                >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {orderGroups.length === 0 ? (
                <Card className="text-center py-20">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">All Caught Up!</h2>
                    <p className="text-secondary-400">No pending orders at the moment.</p>
                </Card>
            ) : (
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {orderGroups.map((order) => (
                        <Card key={order.id} className="flex flex-col">
                            {/* Order Header */}
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-secondary-800">
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        Order #{order.id}
                                    </h3>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant={getPriorityColor(order.priority)}>
                                            {order.priority?.toUpperCase()}
                                        </Badge>
                                        <span className="text-sm text-secondary-400">
                                            Table {order.table_details?.table_number}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant={order.status === 'preparing' ? 'warning' : 'info'}>
                                        {order.status}
                                    </Badge>
                                    <p className="text-xs text-secondary-500 mt-1">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {new Date(order.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="flex-grow space-y-3">
                                {order.orderItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-3 rounded-xl ${getStatusColor(item.status)}`}
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.quantity}x {item.item_name}
                                            </p>
                                            {item.modifiers && item.modifiers.length > 0 && (
                                                <div className="text-sm text-amber-400 mb-1">
                                                    {item.modifiers.map(m => m.value).join(', ')}
                                                </div>
                                            )}
                                            {item.notes && (
                                                <p className="text-sm opacity-75">Note: {item.notes}</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {item.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => updateItemStatus(order.id, item.id, 'preparing')}
                                                    loading={updating === item.id}
                                                >
                                                    Start
                                                </Button>
                                            )}
                                            {item.status === 'preparing' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateItemStatus(order.id, item.id, 'ready')}
                                                    loading={updating === item.id}
                                                >
                                                    Done
                                                </Button>
                                            )}
                                            {item.status === 'ready' && (
                                                <CheckCircle className="w-6 h-6" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default KitchenDisplay
