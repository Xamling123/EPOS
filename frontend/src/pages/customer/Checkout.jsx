import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ordersAPI } from '../../api/orders'
import { paymentsAPI } from '../../api/payments'
import { handleApiError } from '../../api/errorHandler'
import { Card, Badge, Button, Loading, Modal } from '../../components/common/UI'
import {
    ShoppingCart,
    CreditCard,
    Banknote,
    Wallet,
    ArrowLeft,
    CheckCircle,
    AlertCircle
} from 'lucide-react'

export function CustomerCheckout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [paymentProcessing, setPaymentProcessing] = useState(false)

    const orderId = new URLSearchParams(location.search).get('order_id')

    useEffect(() => {
        if (orderId) {
            fetchOrder()
        } else {
            setLoading(false)
        }
    }, [orderId])

    const fetchOrder = async () => {
        try {
            const response = await ordersAPI.getById(orderId)
            setOrder(response.data)
        } catch (err) {
            console.error('Failed to fetch order:', err)
            handleApiError('Fetch Order', err)
        } finally {
            setLoading(false)
        }
    }

    const processPayment = async () => {
        if (!order) return

        setPaymentProcessing(true)
        try {
            if (paymentMethod === 'esewa') {
                // Real eSewa payment integration
                console.log('Initiating eSewa payment for order:', order.id)
                const response = await paymentsAPI.esewaInitiate(order.id)
                
                if (response.data.success && response.data.form_data) {
                    // Create and submit the eSewa form
                    const form = document.createElement('form')
                    form.method = 'POST'
                    form.action = response.data.esewa_url || 'https://uat.esewa.com.np/epay/main'
                    form.style.display = 'none'
                    
                    // Add form data
                    Object.entries(response.data.form_data).forEach(([key, value]) => {
                        const input = document.createElement('input')
                        input.type = 'hidden'
                        input.name = key
                        input.value = value
                        form.appendChild(input)
                    })
                    
                    document.body.appendChild(form)
                    form.submit()
                    document.body.removeChild(form)
                    
                    // Store order ID in session for verification after redirect
                    sessionStorage.setItem('pending_esewa_order', order.id)
                } else {
                    console.error('eSewa initiation failed:', response.data)
                    alert('Failed to initiate eSewa payment. Please try again.')
                }
            } else if (paymentMethod === 'khalti') {
                // Khalti payment (mock)
                const response = await paymentsAPI.mockGateway({
                    order_id: order.id,
                    amount: parseFloat(order.total_amount),
                    payment_method: 'khalti',
                    mock_success: true
                })
                
                if (response.data.success) {
                    alert('Payment successful!')
                    navigate('/dashboard')
                }
            } else if (paymentMethod === 'card') {
                // Card payment (mock)
                const response = await paymentsAPI.mockGateway({
                    order_id: order.id,
                    amount: parseFloat(order.total_amount),
                    payment_method: 'card',
                    mock_success: true
                })
                
                if (response.data.success) {
                    alert('Payment successful!')
                    navigate('/dashboard')
                }
            } else {
                // Cash payment
                alert('Your order has been confirmed. Please pay the cashier.')
                navigate('/dashboard')
            }
        } catch (err) {
            console.error('Payment failed:', err)
            alert(`Payment failed: ${err.response?.data?.detail || err.message}`)
        } finally {
            setPaymentProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading size="lg" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen py-12">
                <div className="container mx-auto px-4">
                    <Card className="text-center py-20">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Order Not Found</h2>
                        <p className="text-secondary-400 mb-6">We couldn't find your order.</p>
                        <Button onClick={() => navigate('/dashboard')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    const orderTotal = parseFloat(order.total_amount)

    return (
        <div className="min-h-screen bg-secondary-950 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-3xl font-display font-bold text-white">
                        Order Checkout
                    </h1>
                </div>

                {/* Order Summary */}
                <Card className="mb-6">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-secondary-700">
                        <div>
                            <h2 className="text-xl font-bold text-white">Order #{order.id}</h2>
                            <p className="text-sm text-secondary-400">
                                Table {order.table_details?.table_number}
                            </p>
                        </div>
                        <Badge variant={order.status === 'paid' ? 'success' : 'info'}>
                            {order.status}
                        </Badge>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-6">
                        <h3 className="font-semibold text-white mb-4">Order Items</h3>
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-secondary-300">
                                    {item.quantity}x {item.item_name}
                                </span>
                                <span className="text-secondary-400">Rs.{item.total_price}</span>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 pt-4 border-t border-secondary-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-400">Subtotal</span>
                            <span className="text-white">Rs.{(orderTotal * 0.9).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-400">Tax (13%)</span>
                            <span className="text-white">Rs.{(orderTotal * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-secondary-700">
                            <span className="text-white">Total</span>
                            <span className="text-primary-400">Rs.{orderTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </Card>

                {/* Payment Options */}
                <Card>
                    <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                            { value: 'cash', label: 'Cash', icon: Banknote, desc: 'Pay at counter' },
                            { value: 'esewa', label: 'eSewa', icon: CreditCard, desc: 'Fast & Secure' },
                            { value: 'card', label: 'Card', icon: CreditCard, desc: 'Credit/Debit' },
                            { value: 'khalti', label: 'Khalti', icon: Wallet, desc: 'Mobile Wallet' },
                        ].map((method) => (
                            <button
                                key={method.value}
                                onClick={() => setPaymentMethod(method.value)}
                                className={`p-4 rounded-xl border-2 transition-all text-left
                    ${paymentMethod === method.value
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-secondary-700 hover:border-secondary-600'
                                    }`}
                            >
                                <method.icon className={`w-6 h-6 mb-2 ${paymentMethod === method.value ? 'text-primary-400' : 'text-secondary-400'}`} />
                                <p className={`font-semibold text-sm ${paymentMethod === method.value ? 'text-white' : 'text-secondary-300'}`}>
                                    {method.label}
                                </p>
                                <p className="text-xs text-secondary-500 mt-1">{method.desc}</p>
                            </button>
                        ))}
                    </div>

                    {paymentMethod === 'esewa' && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-blue-400">eSewa Payment</p>
                                <p className="text-xs text-blue-300 mt-1">
                                    Click "Pay Now" to securely pay via eSewa. You'll be redirected to complete the payment.
                                </p>
                            </div>
                        </div>
                    )}

                    <Button
                        fullWidth
                        size="lg"
                        onClick={processPayment}
                        loading={paymentProcessing}
                    >
                        {paymentMethod === 'esewa' ? '📱 Pay via eSewa' : paymentMethod === 'cash' ? 'Confirm Order' : 'Pay Now'}
                    </Button>
                </Card>

                {/* Info Footer */}
                <p className="text-center text-sm text-secondary-400 mt-6">
                    Your payment is secure and encrypted. Never share your payment details with anyone.
                </p>
            </div>
        </div>
    )
}

export default CustomerCheckout
