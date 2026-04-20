import { useState, useEffect } from 'react'
import { ordersAPI } from '../../api/orders'
import { paymentsAPI } from '../../api/payments'
import { Card, Badge, Button, Loading, Modal } from '../../components/common/UI'
import {
    Receipt,
    CreditCard,
    Banknote,
    CheckCircle,
    Printer,
    RefreshCw,
    AlertCircle
} from 'lucide-react'

export function BillingScreen() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [invoice, setInvoice] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('cash')

    useEffect(() => {
        fetchBillingQueue()
    }, [])

    const fetchBillingQueue = async () => {
        try {
            const response = await ordersAPI.getBillingQueue()
            setOrders(response.data.orders || [])
        } catch (err) {
            console.error('Failed to fetch billing queue:', err)
        } finally {
            setLoading(false)
        }
    }

    const viewInvoice = async (order) => {
        setSelectedOrder(order)
        try {
            const response = await ordersAPI.getInvoice(order.id)
            setInvoice(response.data.invoice)
        } catch (err) {
            console.error('Failed to get invoice:', err)
        }
    }

    const processPayment = async () => {
        if (!selectedOrder || !invoice) return

        setProcessing(true)
        try {
            if (paymentMethod === 'khalti') {
                // Khalti payment (currently mock)
                await paymentsAPI.mockGateway({
                    order_id: selectedOrder.id,
                    amount: parseFloat(invoice.total),
                    payment_method: paymentMethod,
                    mock_success: true
                })
                setSelectedOrder(null)
                setInvoice(null)
                fetchBillingQueue()
            } else {
                // Cash or card payment
                await paymentsAPI.create({
                    order: selectedOrder.id,
                    amount: invoice.total,
                    payment_method: paymentMethod
                })
                setSelectedOrder(null)
                setInvoice(null)
                fetchBillingQueue()
            }
        } catch (err) {
            console.error('Payment failed:', err)
            alert(`Payment failed: ${err.response?.data?.detail || err.message}`)
        } finally {
            setProcessing(false)
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
        <div className="min-h-screen bg-secondary-950 p-4 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">
                        Billing
                    </h1>
                    <p className="text-secondary-400">
                        {orders.length} orders ready for billing
                    </p>
                </div>
                <Button onClick={fetchBillingQueue} variant="secondary" className="gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Refresh
                </Button>
            </div>

            {orders.length === 0 ? (
                <Card className="text-center py-20">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">No Pending Bills</h2>
                    <p className="text-secondary-400">All orders have been processed.</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        Order #{order.id}
                                    </h3>
                                    <p className="text-sm text-secondary-400">
                                        Table {order.table_details?.table_number}
                                    </p>
                                </div>
                                <Badge variant={order.status === 'served' ? 'success' : 'info'}>
                                    {order.status}
                                </Badge>
                            </div>

                            <div className="space-y-2 mb-4">
                                {order.items?.slice(0, 3).map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-secondary-300">
                                            {item.quantity}x {item.item_name}
                                        </span>
                                        <span className="text-secondary-400">Rs.{item.total_price}</span>
                                    </div>
                                ))}
                                {order.items?.length > 3 && (
                                    <p className="text-sm text-secondary-500">
                                        +{order.items.length - 3} more items
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-secondary-800">
                                <div>
                                    <p className="text-sm text-secondary-400">Total</p>
                                    <p className="text-2xl font-bold text-primary-400">
                                        Rs.{order.total_amount}
                                    </p>
                                </div>
                                <Button onClick={() => viewInvoice(order)}>
                                    <Receipt className="w-4 h-4 mr-2" />
                                    Bill
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Invoice Modal */}
            <Modal
                isOpen={!!invoice}
                onClose={() => { setSelectedOrder(null); setInvoice(null); }}
                title="Invoice"
            >
                {invoice && (
                    <>
                        <div className="bg-secondary-800/50 rounded-xl p-4 mb-6">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <p className="text-lg font-bold text-white">{invoice.invoice_number}</p>
                                    <p className="text-sm text-secondary-400">Table {invoice.table}</p>
                                </div>
                                <p className="text-sm text-secondary-400">{invoice.date}</p>
                            </div>

                            <div className="space-y-2 mb-4">
                                {invoice.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-secondary-300">
                                            {item.quantity}x {item.name}
                                        </span>
                                        <span className="text-secondary-400">Rs.{item.total}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-secondary-700 pt-3 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-secondary-400">Subtotal</span>
                                    <span className="text-white">Rs.{invoice.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-secondary-400">Tax ({invoice.tax_rate})</span>
                                    <span className="text-white">Rs.{invoice.tax_amount}</span>
                                </div>
                                {parseFloat(invoice.discount) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-400">Discount</span>
                                        <span className="text-green-400">-Rs.{invoice.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2">
                                    <span className="text-white">Total</span>
                                    <span className="text-primary-400">Rs.{invoice.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-6">
                            <p className="label mb-3">Payment Method</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'cash', label: 'Cash', icon: Banknote },
                                    { value: 'card', label: 'Card', icon: CreditCard },
                                    { value: 'khalti', label: 'Khalti', icon: CreditCard },
                                ].map((method) => (
                                    <button
                                        key={method.value}
                                        onClick={() => setPaymentMethod(method.value)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all
                      ${paymentMethod === method.value
                                                ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                                : 'border-secondary-700 text-secondary-400 hover:border-secondary-600'
                                            }`}
                                    >
                                        <method.icon className="w-5 h-5" />
                                        {method.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="secondary" className="flex-1 gap-2">
                                <Printer className="w-4 h-4" />
                                Print
                            </Button>
                            <Button
                                onClick={processPayment}
                                loading={processing}
                                className="flex-1"
                            >
                                Complete Payment
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    )
}

export default BillingScreen
