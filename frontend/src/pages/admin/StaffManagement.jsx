import { useState, useEffect } from 'react'
import { usersAPI } from '../../api/users'
import { Card, Button, Badge, Loading } from '../../components/common/UI'
import { UserPlus, Trash2, Shield, User } from 'lucide-react'

export default function StaffManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await usersAPI.getAll()
            setUsers(response.data.results || [])
        } catch (err) {
            console.error('Failed to fetch users:', err)
        } finally {
            setLoading(false)
        }
    }

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return
        try {
            await usersAPI.delete(id)
            setUsers(users.filter(user => user.id !== id))
        } catch (err) {
            console.error('Failed to delete user:', err)
        }
    }

    // Filter out customers, show only staff
    const staffMembers = users.filter(user => user.role !== 'customer')

    if (loading) return <Loading />

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Staff Management</h1>
                {/* Add Staff functionality would open a modal here, simplified for now */}
                <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Staff
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffMembers.map(user => (
                    <Card key={user.id} className="relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="danger" onClick={() => deleteUser(user.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-secondary-800 flex items-center justify-center">
                                <User className="w-6 h-6 text-secondary-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{user.full_name}</h3>
                                <p className="text-sm text-secondary-400">{user.email}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <Badge variant="info">
                                <Shield className="w-3 h-3 mr-1 inline" />
                                {user.role.toUpperCase()}
                            </Badge>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
