import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { menuAPI } from '../../api/menu'
import { ordersAPI } from '../../api/orders'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { handleApiError } from '../../api/errorHandler'
import { Card, Badge, Loading, Button } from '../../components/common/UI'
import {
    Leaf,
    Flame,
    Clock,
    Search,
    ShoppingBag,
    Plus,
    Minus,
    X,
    ShoppingCart
} from 'lucide-react'

export function MenuBrowse() {
    const { isAuthenticated } = useAuth()
    const { cartItems, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const reservationId = searchParams.get('reservationId')

    const [categories, setCategories] = useState([])
    const [activeCategory, setActiveCategory] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [placingOrder, setPlacingOrder] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchMenu()
    }, [])

    const fetchMenu = async () => {
        try {
            const response = await menuAPI.getCategoriesWithItems()
            setCategories(response.data.categories || [])
            if (response.data.categories?.length > 0) {
                setActiveCategory(response.data.categories[0].id)
            }
        } catch (err) {
            const errorMsg = handleApiError('Fetch Menu', err)
            setError(errorMsg || 'Failed to load menu')
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = () => {
        let items = []
        if (activeCategory) {
            const category = categories.find(c => c.id === activeCategory)
            items = category?.items || []
        } else {
            items = categories.flatMap(c => c.items || [])
        }

        if (searchQuery) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return items
    }

    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/menu', search: searchParams.toString() } } })
            return
        }

        setPlacingOrder(true)
        try {
            const orderData = {
                order_type: reservationId ? 'pre_order' : 'dine_in',
                reservation: reservationId,
                items: cartItems.map(item => ({
                    menu_item: item.id,
                    quantity: item.quantity,
                    notes: ''
                }))
            }

            await ordersAPI.create(orderData)
            clearCart()
            setIsCartOpen(false)
            navigate('/dashboard') // Redirect to dashboard to see order
        } catch (err) {
            const errorMsg = handleApiError('Place Order', err)
            alert(errorMsg || 'Failed to place order. Please try again.')
        } finally {
            setPlacingOrder(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12 relative">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Our Menu
                    </h1>
                    <p className="text-secondary-400 max-w-2xl mx-auto">
                        Discover our carefully crafted dishes, blending authentic Nepali flavors
                        with international culinary excellence
                    </p>
                    {error && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-12"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all
              ${!activeCategory
                                ? 'bg-primary-500 text-white'
                                : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'
                            }`}
                    >
                        All Items
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all
                ${activeCategory === category.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Menu Items Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredItems().map((item) => (
                        <Card key={item.id} className="flex flex-col group">
                            {item.image_url && (
                                <div className="h-48 rounded-xl overflow-hidden mb-4 -mt-2 -mx-2 relative">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            addToCart(item)
                                            setIsCartOpen(true)
                                        }}
                                        className="absolute bottom-2 right-2 w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                                    <span className="text-xl font-bold text-primary-400 whitespace-nowrap block mt-1">
                                        Rs.{item.price}
                                    </span>
                                </div>
                                {!item.image_url && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            addToCart(item)
                                            setIsCartOpen(true)
                                        }}
                                        className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors flex-shrink-0"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <p className="text-secondary-400 text-sm mt-2 flex-grow">
                                {item.description}
                            </p>

                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-secondary-800">
                                {item.is_vegetarian && (
                                    <span className="flex items-center gap-1 text-xs text-green-400">
                                        <Leaf className="w-4 h-4" />
                                        Veg
                                    </span>
                                )}
                                {item.spice_level > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-orange-400">
                                        <Flame className="w-4 h-4" />
                                        {['Mild', 'Medium', 'Hot'][item.spice_level - 1]}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-xs text-secondary-500 ml-auto">
                                    <Clock className="w-4 h-4" />
                                    {item.preparation_time_mins} min
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>

                {filteredItems().length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-secondary-400">No items found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Cart Button (Floating) */}
            {cartCount > 0 && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-8 right-8 bg-primary-500 text-white p-4 rounded-full shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all z-40 animate-bounce-subtle"
                >
                    <div className="relative">
                        <ShoppingBag className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 bg-white text-primary-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {cartCount}
                        </span>
                    </div>
                </button>
            )}

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsCartOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className="relative w-full max-w-md bg-secondary-900 h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="p-6 border-b border-secondary-800 flex items-center justify-between bg-secondary-900/50 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-primary-400" />
                                Your Order
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-secondary-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12 text-secondary-500">
                                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Your cart is empty</p>
                                    <Button
                                        variant="ghost"
                                        className="mt-4"
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        Browse Menu
                                    </Button>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 bg-secondary-800/50 p-4 rounded-xl">
                                        {item.image_url && (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-20 h-20 rounded-lg object-cover bg-secondary-800"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-white">{item.name}</h4>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-secondary-500 hover:text-red-400"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-primary-400 font-bold mb-3">
                                                Rs.{item.price * item.quantity}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-lg bg-secondary-700 flex items-center justify-center hover:bg-secondary-600 text-white transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-white font-medium w-4 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg bg-secondary-700 flex items-center justify-center hover:bg-secondary-600 text-white transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-secondary-800 bg-secondary-900/50 backdrop-blur-md">
                                <div className="flex justify-between items-center mb-6 text-lg font-bold text-white">
                                    <span>Total</span>
                                    <span className="text-primary-400">Rs.{cartTotal}</span>
                                </div>
                                <Button
                                    className="w-full py-4 text-lg shadow-lg shadow-primary-500/20"
                                    onClick={handlePlaceOrder}
                                    loading={placingOrder}
                                >
                                    {isAuthenticated ? 'Place Order' : 'Login to Order'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MenuBrowse
