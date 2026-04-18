import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { tablesAPI } from '../../api/tables'
import { reservationsAPI } from '../../api/reservations'
import { handleApiError } from '../../api/errorHandler'
import { Button, Card, Badge, Loading } from '../../components/common/UI'
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Check,
    AlertCircle
} from 'lucide-react'
import { format, addDays } from 'date-fns'

export function CreateReservation() {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [checkingAvailability, setCheckingAvailability] = useState(false)
    const [availableTables, setAvailableTables] = useState([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [reservationId, setReservationId] = useState(null)

    const [formData, setFormData] = useState({
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        startTime: '18:00',
        endTime: '20:00',
        guestCount: 2,
        tableId: null,
        specialRequests: ''
    })

    const timeSlots = []
    for (let hour = 10; hour <= 21; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
        timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        // Handle guestCount as integer
        if (name === 'guestCount') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const checkAvailability = async () => {
        setCheckingAvailability(true)
        setError('')

        try {
            // Convert guestCount to integer if it's a string
            const guestCountInt = parseInt(formData.guestCount) || formData.guestCount
            
            const response = await tablesAPI.checkAvailability(
                formData.date,
                formData.startTime,
                formData.endTime,
                guestCountInt
            )
            
            setAvailableTables(response.data.available_tables || [])
            setStep(2)
        } catch (err) {
            const errorMsg = handleApiError('Check Availability', err)
            setError(errorMsg)
        } finally {
            setCheckingAvailability(false)
        }
    }

    const selectTable = (tableId) => {
        setFormData(prev => ({ ...prev, tableId }))
        setStep(3)
    }

    const submitReservation = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/reservations' } } })
            return
        }

        setLoading(true)
        setError('')

        try {
            const reservationData = {
                table: formData.tableId,
                reservation_date: formData.date,
                start_time: formData.startTime,
                end_time: formData.endTime,
                guest_count: parseInt(formData.guestCount) || formData.guestCount,
                special_requests: formData.specialRequests
            }
            
            const response = await reservationsAPI.create(reservationData)
            setSuccess(true)
            setReservationId(response.data.id)
        } catch (err) {
            const errorMsg = handleApiError('Create Reservation', err)
            setError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Reservation Confirmed!</h2>
                    <p className="text-secondary-400 mb-6">
                        Your table has been reserved for {format(new Date(formData.date), 'MMMM d, yyyy')}
                        at {formData.startTime}.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={() => navigate('/dashboard')} className="flex-1">
                            View My Reservations
                        </Button>
                        <Button onClick={() => navigate(`/menu?reservationId=${reservationId}`)} className="flex-1">
                            Pre-Order Food
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-display font-bold text-white mb-4">
                        Reserve a Table
                    </h1>
                    <p className="text-secondary-400">
                        Select your preferred date, time, and party size
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    {[
                        { num: 1, label: 'Date & Time' },
                        { num: 2, label: 'Select Table' },
                        { num: 3, label: 'Confirm' }
                    ].map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${step >= s.num
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-800 text-secondary-500'
                                }`}>
                                {s.num}
                            </div>
                            {i < 2 && (
                                <div className={`w-20 h-1 mx-2 ${step > s.num ? 'bg-primary-500' : 'bg-secondary-800'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Step 1: Date & Time */}
                {step === 1 && (
                    <Card className="max-w-xl mx-auto animate-fade-in">
                        <h2 className="text-xl font-semibold text-white mb-6">Select Date & Time</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="label flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                                    className="input"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Start Time
                                    </label>
                                    <select
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        className="input"
                                    >
                                        {timeSlots.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">End Time</label>
                                    <select
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        className="input"
                                    >
                                        {timeSlots
                                            .filter(time => time > formData.startTime)
                                            .map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Number of Guests
                                </label>
                                <select
                                    name="guestCount"
                                    value={formData.guestCount}
                                    onChange={handleInputChange}
                                    className="input"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                onClick={checkAvailability}
                                loading={checkingAvailability}
                                className="w-full"
                            >
                                Check Availability
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Step 2: Select Table */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Available Tables</h2>
                            <Button variant="ghost" onClick={() => setStep(1)}>
                                Change Date/Time
                            </Button>
                        </div>

                        {availableTables.length === 0 ? (
                            <Card className="text-center py-12">
                                <p className="text-secondary-400 mb-4">
                                    No tables available for {formData.guestCount} guests at this time.
                                </p>
                                <Button onClick={() => setStep(1)}>Try Different Time</Button>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availableTables.map((table) => (
                                    <Card
                                        key={table.id}
                                        className="cursor-pointer hover:border-primary-500 transition-all"
                                        onClick={() => selectTable(table.id)}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-white">
                                                Table {table.table_number}
                                            </h3>
                                            <Badge variant="success">Available</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-secondary-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {table.capacity} seats
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {table.location}
                                            </span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <Card className="max-w-xl mx-auto animate-fade-in">
                        <h2 className="text-xl font-semibold text-white mb-6">Confirm Reservation</h2>

                        <div className="bg-secondary-800/50 rounded-xl p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-secondary-400">Date</span>
                                    <p className="text-white font-medium">
                                        {format(new Date(formData.date), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-secondary-400">Time</span>
                                    <p className="text-white font-medium">
                                        {formData.startTime} - {formData.endTime}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-secondary-400">Guests</span>
                                    <p className="text-white font-medium">{formData.guestCount}</p>
                                </div>
                                <div>
                                    <span className="text-secondary-400">Table</span>
                                    <p className="text-white font-medium">
                                        {availableTables.find(t => t.id === formData.tableId)?.table_number}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="label">Special Requests (optional)</label>
                            <textarea
                                name="specialRequests"
                                value={formData.specialRequests}
                                onChange={handleInputChange}
                                placeholder="E.g., birthday celebration, dietary requirements..."
                                className="input min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={submitReservation} loading={loading} className="flex-1">
                                {isAuthenticated ? 'Confirm Reservation' : 'Login to Reserve'}
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default CreateReservation
