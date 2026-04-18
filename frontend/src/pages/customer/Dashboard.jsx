import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { reservationsAPI } from '../../api/reservations'
import { handleApiError } from '../../api/errorHandler'
import { Card, Badge, Button, Loading, Modal } from '../../components/common/UI'
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Plus,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

export function CustomerDashboard() {
    const { user } = useAuth()
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [cancelModal, setCancelModal] = useState(null)

    useEffect(() => {
        fetchReservations()
    }, [])

    const fetchReservations = async () => {
        try {
            const response = await reservationsAPI.getMyReservations()
            setReservations(response.data.reservations || [])
        } catch (err) {
            handleApiError('Fetch My Reservations', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (id) => {
        try {
            await reservationsAPI.cancel(id)
            fetchReservations()
            setCancelModal(null)
        } catch (err) {
            const errorMsg = handleApiError('Cancel Reservation', err)
            alert(errorMsg || 'Failed to cancel reservation')
        }
    }

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'info',
            seated: 'success',
            completed: 'success',
            cancelled: 'danger',
            no_show: 'danger'
        }
        return <Badge variant={variants[status] || 'neutral'}>{status}</Badge>
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white">
                            Welcome back, {user?.first_name}!
                        </h1>
                        <p className="text-secondary-400 mt-1">
                            Manage your reservations and orders
                        </p>
                    </div>
                    <Link to="/reservations">
                        <Button className="gap-2">
                            <Plus className="w-5 h-5" />
                            New Reservation
                        </Button>
                    </Link>
                </div>

                {/* Reservations */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Your Reservations</h2>

                    {reservations.length === 0 ? (
                        <Card className="text-center py-12">
                            <Calendar className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No Reservations Yet</h3>
                            <p className="text-secondary-400 mb-6">
                                Book your first table and enjoy our dining experience
                            </p>
                            <Link to="/reservations">
                                <Button>Make a Reservation</Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {reservations.map((res) => (
                                <Card key={res.id} className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white">
                                                {format(parseISO(res.reservation_date), 'EEEE, MMMM d, yyyy')}
                                            </h3>
                                            {getStatusBadge(res.status)}
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-secondary-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {res.start_time} - {res.end_time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {res.guest_count} guests
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                Table {res.table_details?.table_number}
                                            </span>
                                        </div>

                                        {res.special_requests && (
                                            <p className="text-sm text-secondary-500 mt-2">
                                                Note: {res.special_requests}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        {['pending', 'confirmed'].includes(res.status) && (
                                            <>
                                                <Link to={`/pre-order/${res.id}`}>
                                                    <Button variant="secondary" size="sm">
                                                        Pre-Order Food
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCancelModal(res)}
                                                    className="text-red-400 hover:bg-red-500/10"
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cancel Modal */}
                <Modal
                    isOpen={!!cancelModal}
                    onClose={() => setCancelModal(null)}
                    title="Cancel Reservation"
                >
                    <p className="text-secondary-400 mb-6">
                        Are you sure you want to cancel your reservation for{' '}
                        Are you sure you want to cancel your reservation for{' '}
                        {cancelModal && format(parseISO(cancelModal.reservation_date), 'MMMM d, yyyy')}?
                    </p>
                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => setCancelModal(null)}
                            className="flex-1"
                        >
                            Keep Reservation
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleCancel(cancelModal?.id)}
                            className="flex-1"
                        >
                            Yes, Cancel
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    )
}

export default CustomerDashboard
