import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart))
            } catch (e) {
                console.error('Failed to parse cart', e)
            }
        }
    }, [])

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (item) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            }
            return [...prev, { ...item, quantity: 1 }]
        })
        setIsCartOpen(true)
    }

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId))
    }

    const updateQuantity = (itemId, quantity) => {
        if (quantity < 1) {
            removeFromCart(itemId)
            return
        }
        setCartItems(prev =>
            prev.map(i =>
                i.id === itemId
                    ? { ...i, quantity }
                    : i
            )
        )
    }

    const clearCart = () => {
        setCartItems([])
        localStorage.removeItem('cart')
    }

    const cartTotal = cartItems.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
    )

    const cartCount = cartItems.reduce(
        (count, item) => count + item.quantity,
        0
    )

    const toggleCart = () => setIsCartOpen(prev => !prev)

    const value = {
        cartItems,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        toggleCart,
        setIsCartOpen
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export default CartContext
