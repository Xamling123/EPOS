import { useState, useEffect } from 'react'
import { reservationsAPI } from '../../api/reservations'
import { handleApiError } from '../../api/errorHandler'
import { Card, Button, Badge, Loading } from '../../components/common/UI'
import { Check, X, Bell } from 'lucide-react'
import { format } from 'date-fns'

export default function ReservationManagement() {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReservations()
    }, [])

    const fetchReservations = async () => {
        try {
            const response = await reservationsAPI.getAll()
            setReservations(response.data.results || [])
        } catch (err) {
            handleApiError('Fetch Reservations', err)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id, status) => {
        try {
            await reservationsAPI.updateStatus(id, status)
            // Local update to avoid full refresh
            setReservations(reservations.map(res =>
                res.id === id ? { ...res, status } : res
            ))
        } catch (err) {
            const errorMsg = handleApiError(`Update status to ${status}`, err)
            alert(errorMsg || `Failed to update status to ${status}`)
        }
    }

    if (loading) return <Loading />

    // Group by status for better visibility or just order by date desc
    const sortedReservations = [...reservations].sort((a, b) =>
        new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Reservation Monitoring</h1>
                <Button onClick={fetchReservations} variant="secondary">
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4">
                {sortedReservations.length === 0 ? (
                    <Card className="text-center py-10">
                        <p className="text-secondary-400">No reservations found.</p>
                    </Card>
                ) : (
                    sortedReservations.map(res => (
                        <Card key={res.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-bold text-white">
                                        {res.customer_name || 'Unknown Customer'}
                                    </h3>
                                    <Badge variant={
                                        res.status === 'confirmed' ? 'success' :
                                            res.status === 'cancelled' ? 'danger' :
                                                'warning'
                                    }>
                                        {res.status}
                                    </Badge>
                                </div>
                                <div className="text-secondary-400 space-y-1">
                                    <p>Date: {format(new Date(res.date), 'MMMM dd, yyyy')} at {res.time}</p>
                                    <p>Guests: {res.guests} | Table: {res.table_details?.table_number || 'Not Assigned'}</p>
                                    {res.special_requests && (
                                        <p className="text-sm italic">Note: {res.special_requests}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {res.status === 'pending' && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="success"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => updateStatus(res.id, 'confirmed')}
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Confirm
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => updateStatus(res.id, 'cancelled')}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Decline
                                        </Button>
                                    </>
                                )}
                                {res.status === 'confirmed' && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => updateStatus(res.id, 'completed')}
                                    >
                                        Mark Completed
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
