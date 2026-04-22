import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ordersAPI } from '../../api/orders'
import { tablesAPI } from '../../api/tables'
import { menuAPI } from '../../api/menu'
import { handleApiError } from '../../api/errorHandler'
import { Card, Badge, Button, Modal, Input, Loading } from '../../components/common/UI'
import {
    ArrowLeft,
    Trash2,
    Plus,
    Minus,
    Edit2,
    Check,
    Clock,
    Users,
    DollarSign,
    ShoppingCart,
    AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

export default function ViewOrder() {
    const navigate = useNavigate()
    const { orderId } = useParams()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)
    const [showAddItemModal, setShowAddItemModal] = useState(false)
    const [showModifierModal, setShowModifierModal] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [editingItemModifiers, setEditingItemModifiers] = useState([])
    
    const [menuItems, setMenuItems] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [menuSearchTerm, setMenuSearchTerm] = useState('')
    const [itemToAdd, setItemToAdd] = useState(null)
    const [itemQuantity, setItemQuantity] = useState(1)
    const [selectedModifiers, setSelectedModifiers] = useState({})

    useEffect(() => {
        fetchOrderDetails()
        fetchMenuData()
    }, [orderId])

    const fetchOrderDetails = async () => {
        try {
            const response = await ordersAPI.getById(orderId)
            setOrder(response.data)
        } catch (err) {
            handleApiError('Fetch Order', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMenuData = async () => {
        try {
            const [catResponse, itemsResponse] = await Promise.all([
                menuAPI.getCategories(),
                menuAPI.getAll()
            ])
            setCategories(catResponse.data.results || [])
            setMenuItems(itemsResponse.data.results || [])
        } catch (err) {
            console.error('Failed to fetch menu:', err)
        }
    }

    const filteredMenuItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category?.id === parseInt(selectedCategory)
        const matchesSearch = item.name.toLowerCase().includes(menuSearchTerm.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const handleAddItem = (item) => {
        setItemToAdd(item)
        setItemQuantity(1)
        setSelectedModifiers({})
        setShowModifierModal(true)
    }

    const handleSaveItemModifiers = async () => {
        if (!itemToAdd) return

        setUpdating('add')
        try {
            const modifierArray = Object.entries(selectedModifiers)
                .filter(([_, value]) => value)
                .map(([key, value]) => parseInt(key))

            // Use the ordersAPI.addItem endpoint instead of manual update
            await ordersAPI.addItem(orderId, {
                menu_item: itemToAdd.id,
                quantity: itemQuantity,
                modifiers: modifierArray
            })
            
            fetchOrderDetails()
            setShowModifierModal(false)
            setItemToAdd(null)
        } catch (err) {
            handleApiError('Add Item', err)
        } finally {
            setUpdating(null)
        }
    }

    const handleRemoveItem = async (itemIndex) => {
        if (!window.confirm('Remove this item from the order?')) return

        const item = order.items[itemIndex]
        if (!item?.id) return

        setUpdating(`remove-${itemIndex}`)
        try {
            await ordersAPI.removeItem(orderId, item.id)
            fetchOrderDetails()
        } catch (err) {
            handleApiError('Remove Item', err)
        } finally {
            setUpdating(null)
        }
    }

    const handleUpdateQuantity = async (itemIndex, newQuantity) => {
        const item = order.items[itemIndex]
        if (!item?.id) return

        if (newQuantity < 1) {
            handleRemoveItem(itemIndex)
            return
        }

        setUpdating(`qty-${itemIndex}`)
        try {
            await ordersAPI.updateItemQuantity(orderId, item.id, newQuantity)
            fetchOrderDetails()
        } catch (err) {
            handleApiError('Update Quantity', err)
        } finally {
            setUpdating(null)
        }
    }

    const handleUpdateStatus = async (newStatus) => {
        setUpdating('status')
        try {
            await ordersAPI.updateStatus(orderId, newStatus)
            fetchOrderDetails()
        } catch (err) {
            handleApiError('Update Status', err)
        } finally {
            setUpdating(null)
        }
    }

    if (loading) return <Loading />
    if (!order) return <div className="text-red-400">Order not found</div>

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning'
            case 'confirmed': return 'info'
            case 'ready': return 'success'
            case 'served': return 'secondary'
            default: return 'secondary'
        }
    }

    const itemDetails = order.items?.map(item => ({
        ...item,
        // item_name is already provided by the backend
        name: item.item_name
    })) || []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/waiter/active-orders')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Order #{order.id}</h1>
                        <p className="text-secondary-400">Table {order.table_details?.table_number}</p>
                    </div>
                </div>
                <Badge variant={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                </Badge>
            </div>

            {/* Order Info Grid */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-secondary-400 text-sm mb-1 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Time
                    </div>
                    <p className="text-white font-semibold">
                        {format(new Date(order.created_at), 'HH:mm:ss')}
                    </p>
                </Card>
                <Card className="p-4">
                    <div className="text-secondary-400 text-sm mb-1 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Guests
                    </div>
                    <p className="text-white font-semibold">
                        {order.table_details?.capacity || '-'}
                    </p>
                </Card>
                <Card className="p-4">
                    <div className="text-secondary-400 text-sm mb-1 flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" />
                        Items
                    </div>
                    <p className="text-white font-semibold">
                        {itemDetails.length}
                    </p>
                </Card>
                <Card className="p-4">
                    <div className="text-secondary-400 text-sm mb-1 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Total
                    </div>
                    <p className="text-white font-semibold">
                        Rs.{parseFloat(order.total_amount || 0).toFixed(2)}
                    </p>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">Order Items</h2>
                        <Button
                            onClick={() => setShowAddItemModal(true)}
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Item
                        </Button>
                    </div>

                    {itemDetails.length === 0 ? (
                        <Card className="text-center py-8">
                            <p className="text-secondary-400">No items in this order</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {itemDetails.map((item, idx) => (
                                <Card key={idx} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-white">
                                                    {item.name || 'Unknown Item'}
                                                </h3>
                                                <Badge variant="secondary">
                                                    x{item.quantity}
                                                </Badge>
                                            </div>

                                            {item.modifiers && item.modifiers.length > 0 && (
                                                <div className="mb-2 flex flex-wrap gap-1">
                                                    {item.modifiers.map((modifier, midx) => (
                                                        <Badge key={midx} variant="secondary" className="text-xs">
                                                            {typeof modifier === 'string' ? modifier : modifier.name || `Modifier ${midx + 1}`}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            <p className="text-sm text-primary-400 font-semibold">
                                                Rs.{parseFloat(item.total_price || 0).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 bg-secondary-800 rounded-lg p-1">
                                                <button
                                                    onClick={() => handleUpdateQuantity(idx, item.quantity - 1)}
                                                    disabled={updating === `qty-${idx}`}
                                                    className="text-secondary-400 hover:text-white p-1 disabled:opacity-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-white font-medium px-2 min-w-[2rem] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(idx, item.quantity + 1)}
                                                    disabled={updating === `qty-${idx}`}
                                                    className="text-secondary-400 hover:text-white p-1 disabled:opacity-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveItem(idx)}
                                                disabled={updating === `remove-${idx}`}
                                                className="text-red-400 hover:text-red-300 p-2 disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order Actions Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Order Status
                        </h3>

                        <div className="space-y-2">
                            <Button
                                onClick={() => handleUpdateStatus('confirmed')}
                                disabled={order.status !== 'pending' || updating === 'status'}
                                loading={updating === 'status'}
                                variant={order.status === 'confirmed' ? 'success' : 'secondary'}
                                fullWidth
                                className="justify-start"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Confirm Order
                            </Button>

                            <Button
                                onClick={() => handleUpdateStatus('ready')}
                                disabled={order.status !== 'confirmed' || updating === 'status'}
                                loading={updating === 'status'}
                                variant={order.status === 'ready' ? 'success' : 'secondary'}
                                fullWidth
                                className="justify-start"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Mark Ready
                            </Button>

                            <Button
                                onClick={() => handleUpdateStatus('served')}
                                disabled={order.status !== 'ready' || updating === 'status'}
                                loading={updating === 'status'}
                                variant={order.status === 'served' ? 'secondary' : 'success'}
                                fullWidth
                                className="justify-start"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Mark Served
                            </Button>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-semibold text-white mb-4">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-secondary-400">
                                <span>Items:</span>
                                <span className="text-white">{itemDetails.length}</span>
                            </div>
                            <div className="flex justify-between text-secondary-400 border-t border-secondary-700 pt-2">
                                <span>Total:</span>
                                <span className="text-primary-400 font-semibold">
                                    Rs.{parseFloat(order.total_amount || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Add Item Modal */}
            <Modal
                isOpen={showAddItemModal}
                onClose={() => setShowAddItemModal(false)}
                title="Add Item to Order"
            >
                <div className="space-y-4 max-h-96">
                    <Input
                        placeholder="Search items..."
                        value={menuSearchTerm}
                        onChange={(e) => setMenuSearchTerm(e.target.value)}
                    />

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                                selectedCategory === 'all'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'
                            }`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                                    selectedCategory === cat.id
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredMenuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleAddItem(item)}
                                className="w-full text-left p-3 bg-secondary-800 hover:bg-secondary-700 rounded-lg transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-white font-medium">{item.name}</p>
                                        {item.description && (
                                            <p className="text-xs text-secondary-400 mt-1">{item.description}</p>
                                        )}
                                    </div>
                                    <p className="text-primary-400 font-semibold">Rs.{item.price}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setShowAddItemModal(false)}
                            fullWidth
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modifier Selection Modal */}
            {itemToAdd && (
                <Modal
                    isOpen={showModifierModal}
                    onClose={() => {
                        setShowModifierModal(false)
                        setItemToAdd(null)
                    }}
                    title={`Add ${itemToAdd.name} to Order`}
                >
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {/* Quantity */}
                        <div>
                            <label className="label mb-2">Quantity</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                                    className="w-10 h-10 rounded-lg bg-secondary-800 hover:bg-secondary-700 text-white flex items-center justify-center"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <input
                                    type="number"
                                    value={itemQuantity}
                                    onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="input flex-1 text-center"
                                    min="1"
                                />
                                <button
                                    onClick={() => setItemQuantity(itemQuantity + 1)}
                                    className="w-10 h-10 rounded-lg bg-secondary-800 hover:bg-secondary-700 text-white flex items-center justify-center"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Modifiers (if any) */}
                        {itemToAdd.modifiers && itemToAdd.modifiers.length > 0 && (
                            <div>
                                <label className="label mb-2">Modifiers</label>
                                <div className="space-y-2">
                                    {itemToAdd.modifiers.map(modifier => (
                                        <label key={modifier.id} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedModifiers[modifier.id]}
                                                onChange={(e) => {
                                                    setSelectedModifiers(prev => ({
                                                        ...prev,
                                                        [modifier.id]: e.target.checked
                                                    }))
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-white">{modifier.name}</span>
                                            {modifier.price > 0 && (
                                                <span className="text-primary-400 text-sm ml-auto">+Rs.{modifier.price}</span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowModifierModal(false)
                                    setItemToAdd(null)
                                }}
                                fullWidth
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveItemModifiers}
                                loading={updating === 'add'}
                                fullWidth
                            >
                                Add Item
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
