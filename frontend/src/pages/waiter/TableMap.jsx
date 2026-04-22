import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tablesAPI } from '../../api/tables'
import { handleApiError } from '../../api/errorHandler'
import { Card, Button, Badge, Loading } from '../../components/common/UI'
import { Users, Clock, PlusCircle } from 'lucide-react'

export default function TableMap() {
    const navigate = useNavigate()
    const [tables, setTables] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTables()
        const interval = setInterval(fetchTables, 30000) // Auto refresh
        return () => clearInterval(interval)
    }, [])

    const fetchTables = async () => {
        try {
            const response = await tablesAPI.getAll()
            setTables(response.data.results || [])
        } catch (err) {
            handleApiError('Fetch Tables', err)
        } finally {
            setLoading(false)
        }
    }

    const handleTableClick = (table) => {
        if (table.status === 'occupied') {
            // View active order for this table
            navigate(`/waiter/orders/${table.active_order_id}`)
        } else {
            // Navigate to Order Entry for this table
            navigate(`/waiter/order-entry/${table.id}`)
        }
    }

    if (loading) return <Loading />

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30'
            case 'occupied': return 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30'
            case 'reserved': return 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30'
            case 'maintenance': return 'bg-gray-500/20 border-gray-500/50 opacity-50'
            default: return 'bg-secondary-800 border-secondary-700'
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Table Map</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.map(table => (
                    <button
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`
                            aspect-square rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all
                            ${getStatusColor(table.status)}
                        `}
                    >
                        <div className="text-2xl font-bold text-white">
                            {table.table_number}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-secondary-300">
                            <Users className="w-4 h-4" />
                            <span>{table.capacity}</span>
                        </div>

                        <Badge variant={
                            table.status === 'available' ? 'success' :
                                table.status === 'occupied' ? 'destructive' :
                                    table.status === 'reserved' ? 'warning' : 'secondary'
                        }>
                            {table.status.toUpperCase()}
                        </Badge>

                        {table.status === 'available' && (
                            <div className="text-xs text-green-400 font-medium flex items-center gap-1">
                                <PlusCircle className="w-3 h-3" />
                                Take Order
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div className="flex gap-6 justify-center mt-8">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50" />
                    <span className="text-secondary-400">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50" />
                    <span className="text-secondary-400">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50" />
                    <span className="text-secondary-400">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-500/20 border border-gray-500/50" />
                    <span className="text-secondary-400">Maintenance</span>
                </div>
            </div>
        </div>
    )
}
