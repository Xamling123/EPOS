import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { paymentsAPI } from '../../api/payments'
import { handleApiError } from '../../api/errorHandler'
import { Card, Button, Loading } from '../../components/common/UI'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export function PaymentSuccess() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('order_id')
    const paymentId = searchParams.get('payment_id')
    const [loading, setLoading] = useState(true)
    const [paymentData, setPaymentData] = useState(null)

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                if (paymentId) {
                    const response = await paymentsAPI.getById(paymentId)
                    setPaymentData(response.data)
                }
            } catch (err) {
                handleApiError('Fetch Payment Details', err)
            } finally {
                setLoading(false)
            }
        }

        verifyPayment()
    }, [paymentId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <Card className="max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                <p className="text-secondary-400 mb-6">
                    Your payment has been processed successfully.
                </p>

                {paymentData && (
                    <div className="bg-secondary-800 rounded-lg p-4 mb-6 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-400">Order ID:</span>
                            <span className="text-white font-semibold">#{paymentData.order}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-400">Payment ID:</span>
                            <span className="text-white font-semibold">#{paymentData.id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-400">Amount:</span>
                            <span className="text-green-400 font-semibold">Rs. {paymentData.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-400">Status:</span>
                            <span className="text-green-400 font-semibold capitalize">{paymentData.status}</span>
                        </div>
                        {paymentData.transaction_id && (
                            <div className="flex justify-between text-sm">
                                <span className="text-secondary-400">Transaction ID:</span>
                                <span className="text-white font-mono text-xs">{paymentData.transaction_id}</span>
                            </div>
                        )}
                    </div>
                )}

                <p className="text-secondary-400 text-sm mb-6">
                    Your order is now ready for preparation. You can track it in real-time.
                </p>

                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/dashboard')}
                        className="flex-1"
                    >
                        View Orders
                    </Button>
                    <Button
                        onClick={() => navigate('/cashier/billing')}
                        className="flex-1"
                    >
                        New Payment
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export function PaymentFailure() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('order_id')
    const errorMsg = searchParams.get('error') || 'Payment processing failed'

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <Card className="max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-8 h-8 text-red-400" />
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
                <p className="text-red-400 mb-6">
                    {errorMsg}
                </p>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-secondary-300">
                        Your payment could not be processed. Please try again or contact support.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        className="flex-1"
                    >
                        Go Back
                    </Button>
                    <Button
                        onClick={() => navigate('/cashier/billing')}
                        className="flex-1"
                    >
                        Retry Payment
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export function PaymentPending() {
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('order_id')

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <Card className="max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Clock className="w-8 h-8 text-amber-400" />
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2">Processing Payment...</h1>
                <p className="text-secondary-400 mb-6">
                    Please wait while we verify your payment.
                </p>

                <div className="space-y-2">
                    <div className="h-2 bg-secondary-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{width: '66%'}} />
                    </div>
                    <p className="text-xs text-secondary-400">Do not refresh or close this page</p>
                </div>
            </Card>
        </div>
    )
}

export default PaymentSuccess
