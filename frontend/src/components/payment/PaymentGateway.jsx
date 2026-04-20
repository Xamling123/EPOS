import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paymentsAPI } from '../../api/payments'
import { handleApiError } from '../../api/errorHandler'
import { Button, Card, Badge, Loading } from '../../components/common/UI'
import { DollarSign, Send, AlertCircle, CheckCircle } from 'lucide-react'

export function PaymentGateway({ order, onPaymentComplete, onPaymentFailed }) {
    const navigate = useNavigate()
    const [selectedMethod, setSelectedMethod] = useState('cash')
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const paymentMethods = [
        { id: 'cash', name: 'Cash', icon: '💵', description: 'Pay in cash at counter' },
        { id: 'mock', name: 'Test Payment', icon: '✓', description: 'Test mode (auto-approved)' },
    ]

    const handleCashPayment = async () => {
        setProcessing(true)
        setError('')
        try {
            // For cash, use mock gateway
            const response = await paymentsAPI.mockGateway({
                order_id: order.id,
                amount: order.total_amount,
                payment_method: 'cash',
                mock_success: true
            })
            
            setSuccess(true)
            onPaymentComplete && onPaymentComplete(response.data.payment)
        } catch (err) {
            const errorMsg = handleApiError('Cash Payment', err)
            setError(errorMsg)
            onPaymentFailed && onPaymentFailed(errorMsg)
        } finally {
            setProcessing(false)
        }
    }


    const handleTestPayment = async () => {
        setProcessing(true)
        setError('')
        try {
            // Use mock gateway with auto-success
            const response = await paymentsAPI.mockGateway({
                order_id: order.id,
                amount: order.total_amount,
                payment_method: 'cash',
                mock_success: true
            })
            
            setSuccess(true)
            onPaymentComplete && onPaymentComplete(response.data.payment)
        } catch (err) {
            const errorMsg = handleApiError('Test Payment', err)
            setError(errorMsg)
            onPaymentFailed && onPaymentFailed(errorMsg)
        } finally {
            setProcessing(false)
        }
    }

    const handlePaymentClick = (method) => {
        switch (method.id) {
            case 'cash':
                handleCashPayment()
                break
            case 'mock':
                handleTestPayment()
                break
            default:
                setError('Payment method not implemented')
        }
    }

    if (success) {
        return (
            <Card className="max-w-md mx-auto text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Payment Successful</h3>
                <p className="text-secondary-400 mb-6">
                    Order #{order.id} has been paid successfully
                </p>
                <Button 
                    onClick={() => navigate('/cashier/billing')} 
                    className="w-full"
                >
                    Back to Billing
                </Button>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Order Summary */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="space-y-3 py-4 border-y border-secondary-700">
                    <div className="flex justify-between text-secondary-400">
                        <span>Order #{order.id}</span>
                        <Badge variant="info">
                            {order.items?.length || 0} items
                        </Badge>
                    </div>
                    <div className="flex justify-between text-secondary-300">
                        <span>Subtotal:</span>
                        <span>Rs. {(order.total_amount / 1.13).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-secondary-300">
                        <span>VAT (13%):</span>
                        <span>Rs. {(order.total_amount - order.total_amount / 1.13).toFixed(2)}</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-secondary-700 flex justify-between">
                    <span className="text-lg font-bold text-white">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary-400">
                        Rs. {parseFloat(order.total_amount).toFixed(2)}
                    </span>
                </div>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Select Payment Method</h3>
                
                <div className="grid gap-3">
                    {paymentMethods.map(method => (
                        <button
                            key={method.id}
                            onClick={() => {
                                setSelectedMethod(method.id)
                                handlePaymentClick(method)
                            }}
                            disabled={processing}
                            className={`p-4 rounded-xl border-2 transition-all text-left
                                ${selectedMethod === method.id && !processing
                                    ? 'border-primary-500 bg-primary-500/10'
                                    : 'border-secondary-700 bg-secondary-800/50 hover:border-primary-500/50'
                                }
                                ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{method.icon}</span>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">{method.name}</div>
                                    <div className="text-sm text-secondary-400">{method.description}</div>
                                </div>
                                {selectedMethod === method.id && !processing && (
                                    <DollarSign className="w-5 h-5 text-primary-400" />
                                )}
                                {selectedMethod === method.id && processing && (
                                    <Loading size="sm" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}
        </div>
    )
}

export default PaymentGateway
