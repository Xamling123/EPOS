import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { menuAPI } from '../../api/menu'
import { ordersAPI } from '../../api/orders'
import { handleApiError } from '../../api/errorHandler'
import { Card, Button, Input, Loading } from '../../components/common/UI'
import { Search, Plus, Minus, ShoppingCart, ArrowLeft, Send } from 'lucide-react'

export default function OrderEntry() {
    const { tableId } = useParams()
    const navigate = useNavigate()

    const [categories, setCategories] = useState([])
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [cart, setCart] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [modifierModalOpen, setModifierModalOpen] = useState(false)
    const [selectedItemForModifiers, setSelectedItemForModifiers] = useState(null)
    const [selectedModifiers, setSelectedModifiers] = useState([])


    useEffect(() => {
        fetchMenu()
    }, [])

    const fetchMenu = async () => {
        try {
            const [catsRes, itemsRes] = await Promise.all([
                menuAPI.getCategories(),
                menuAPI.getItems()
            ])
            setCategories(catsRes.data.results || [])
            setItems(itemsRes.data.results || [])
            if (catsRes.data.results?.length > 0) {
                setSelectedCategory(catsRes.data.results[0].id)
            }
        } catch (err) {
            handleApiError('Fetch Menu', err)
            alert('Failed to load menu. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleItemClick = (item) => {
        if (item.available_modifiers && item.available_modifiers.length > 0) {
            setSelectedItemForModifiers(item)
            setSelectedModifiers([])
            setModifierModalOpen(true)
        } else {
            addToCart(item)
        }
    }

    const toggleModifier = (modName, option, isMulti) => {
        setSelectedModifiers(prev => {
            const exists = prev.some(m => m.name === modName && m.value === option)
            if (exists) {
                return prev.filter(m => !(m.name === modName && m.value === option))
            }
            if (!isMulti) {
                return [...prev.filter(m => m.name !== modName), { name: modName, value: option }]
            }
            return [...prev, { name: modName, value: option }]
        })
    }

    const confirmModifiers = () => {
        const itemWithModifiers = {
            ...selectedItemForModifiers,
            modifiers: selectedModifiers,
            id: selectedItemForModifiers.id + '-' + Date.now() // Unique ID for cart to allow distinct modified items
        }
        addToCart(itemWithModifiers)
        setModifierModalOpen(false)
        setSelectedItemForModifiers(null)
        setSelectedModifiers([])
    }

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { ...item, quantity: 1 }]
        })
    }

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i.id !== itemId))
    }

    const updateQuantity = (itemId, delta) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = Math.max(0, i.quantity + delta)
                return { ...i, quantity: newQty }
            }
            return i
        }).filter(i => i.quantity > 0))
    }

    const submitOrder = async () => {
        if (cart.length === 0) return
        setSubmitting(true)
        try {
            // Create order for table
            await ordersAPI.create({
                table: tableId,
                items: cart.map(item => ({
                    menu_item: item.menu_item_id || item.id, // Handle unique cart IDs
                    quantity: item.quantity,
                    modifiers: item.modifiers || [],
                    notes: ''
                })),
                order_type: 'dine_in',
                priority: 'normal',
                status: 'confirmed'

            })
            alert('Order placed successfully!')
            navigate('/waiter/tables')
        } catch (err) {
            const errorMsg = handleApiError('Submit Order', err)
            alert(errorMsg || 'Failed to submit order. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch && item.is_available
    })

    const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)

    if (loading) return <Loading />

    return (
        <div className="h-[calc(100vh-theme(spacing.32))] flex gap-6">
            {/* Menu Section */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex gap-4 mb-4">
                    <Button variant="secondary" onClick={() => navigate('/waiter/tables')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <Input
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={Search}
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`
                                px-4 py-2 rounded-xl whitespace-nowrap transition-colors
                                ${selectedCategory === cat.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'}
                            `}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}

                                className="bg-secondary-800 p-4 rounded-xl text-left hover:bg-secondary-700 transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors">
                                        {item.name}
                                    </h3>
                                    <span className="text-primary-400 font-medium">
                                        {item.price}
                                    </span>
                                </div>
                                <p className="text-sm text-secondary-400 line-clamp-2">{item.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Section */}
            <div className="w-96 bg-secondary-900 rounded-2xl flex flex-col border border-secondary-800">
                <div className="p-4 border-b border-secondary-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary-400" />
                        Current Order
                    </h2>
                    <p className="text-sm text-secondary-400">Table {tableId}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-10 text-secondary-500">
                            Select items to add to order
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-secondary-800 p-3 rounded-xl">
                                <div>
                                    <p className="font-medium text-white">{item.name}</p>
                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <div className="text-xs text-primary-400 mb-1">
                                            {item.modifiers.map(m => m.value).join(', ')}
                                        </div>
                                    )}
                                    <p className="text-sm text-secondary-400">Rs.{item.price}</p>

                                </div>
                                <div className="flex items-center gap-3 bg-secondary-900 rounded-lg p-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="w-8 h-8 flex items-center justify-center text-secondary-400 hover:text-white"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-medium text-white w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="w-8 h-8 flex items-center justify-center text-secondary-400 hover:text-white"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-secondary-800 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold text-white">
                        <span>Total</span>
                        <span>Rs.{cartTotal.toFixed(2)}</span>
                    </div>
                    <Button
                        fullWidth
                        size="lg"
                        onClick={submitOrder}
                        disabled={cart.length === 0 || submitting}
                        loading={submitting}
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Send for Preparation
                    </Button>
                </div>
            </div>
        </div>
    )
}
