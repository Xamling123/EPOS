import { useState } from 'react'
import { AlertCircle, CreditCard, CheckCircle } from 'lucide-react'
import { Button } from '../../components/common/UI'
import { paymentsAPI } from '../../api/payments'

/**
 * DepositPayment Component
 * Handles upfront deposits for orders and bookings
 */
export function DepositPayment({
    amount = 500,
    orderType = 'order', // 'order' or 'reservation'
    orderId = null,
    onPaymentSuccess = null,
    onPaymentFailed = null,
    loading = false
}) {
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState(null)

    const handleDepositPayment = async () => {
        if (!orderId) {
            setError('Order/Booking not found')
            return
        }

        setProcessing(true)
        setError(null)

        try {
            // Process deposit payment
            console.log(`Processing ${orderType} deposit payment for ID:`, orderId)
            const response = await paymentsAPI.mockGateway({
                order_id: orderId,
                amount: amount,
                payment_method: 'cash',
                mock_success: true
            })

            if (response.data.success) {
                if (onPaymentSuccess) {
                    onPaymentSuccess()
                }
            } else {
                const errorMsg = 'Failed to process payment'
                setError(errorMsg)
                console.error('Payment initiation failed:', response.data)
                if (onPaymentFailed) {
                    onPaymentFailed(errorMsg)
                }
            }
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message || 'Payment failed'
            setError(errorMsg)
            console.error('Deposit payment error:', err)
            if (onPaymentFailed) {
                onPaymentFailed(errorMsg)
            }
        } finally {
            setProcessing(false)
        }
    }

    const typeLabel = orderType === 'reservation' ? 'Table Booking' : 'Food Order'
    const typeEmoji = orderType === 'reservation' ? '🎫' : '🍽️'

    return (
        <div className="space-y-6">
            {/* Deposit Info */}
            <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                            {typeEmoji} Deposit Payment Required
                        </h3>
                        <p className="text-secondary-400 text-sm mb-3">
                            A deposit of <strong>Rs.{amount}</strong> is required to confirm your {typeLabel.toLowerCase()}.
                            This secures your order and will be credited towards your final bill.
                        </p>
                        <p className="text-xs text-secondary-500">
                            ✓ Secure payment  |  ✓ Instant confirmation  |  ✓ Credited to your bill
                        </p>
                    </div>
                </div>
            </div>

            {/* Amount Display */}
            <div className="bg-secondary-800/50 rounded-xl p-4 border border-secondary-700">
                <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Deposit Amount</span>
                    <span className="text-3xl font-bold text-primary-400">Rs.{amount}</span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-400">Payment Failed</p>
                        <p className="text-xs text-red-300 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-400">Payment Processing</p>
                    <p className="text-xs text-blue-300 mt-1">
                        Click the button below to securely process your payment. Your deposit will be confirmed immediately.
                    </p>
                </div>
            </div>

            {/* Payment Button */}
            <Button
                fullWidth
                size="lg"
                onClick={handleDepositPayment}
                loading={processing || loading}
                disabled={!orderId || processing || loading}
                className="gap-2"
            >
                <CreditCard className="w-5 h-5" />
                Pay Deposit
            </Button>

            {/* Terms */}
            <p className="text-xs text-secondary-500 text-center">
                By proceeding, you agree to pay the deposit amount.
                No additional charges will be applied.
            </p>
        </div>
    )
}

export default DepositPayment
