import { useState, useEffect } from 'react'
import { menuAPI } from '../../api/menu'
import { Card, Button, Badge, Loading } from '../../components/common/UI'
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function MenuManagement() {
    const [items, setItems] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [itemsRes, catsRes] = await Promise.all([
                menuAPI.getItems(),
                menuAPI.getCategories()
            ])
            setItems(itemsRes.data.results || [])
            setCategories(catsRes.data.results || [])
        } catch (err) {
            console.error('Failed to fetch menu data:', err)
        } finally {
            setLoading(false)
        }
    }

    const toggleAvailability = async (id) => {
        try {
            await menuAPI.toggleAvailability(id)
            setItems(items.map(item =>
                item.id === id ? { ...item, is_available: !item.is_available } : item
            ))
        } catch (err) {
            console.error('Failed to toggle availability:', err)
        }
    }

    const deleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return
        try {
            await menuAPI.deleteItem(id)
            setItems(items.filter(item => item.id !== id))
        } catch (err) {
            console.error('Failed to delete item:', err)
        }
    }

    const filteredItems = selectedCategory === 'all'
        ? items
        : items.filter(item => item.category === parseInt(selectedCategory))

    if (loading) return <Loading />

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Menu Management</h1>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                    variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
                    onClick={() => setSelectedCategory('all')}
                    size="sm"
                >
                    All
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id.toString() ? 'primary' : 'secondary'}
                        onClick={() => setSelectedCategory(cat.id.toString())}
                        size="sm"
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <Card key={item.id} className="relative group">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary" onClick={() => { }}>
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => deleteItem(item.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                <p className="text-secondary-400 text-sm mt-1">{item.description}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <span className="text-lg font-bold text-primary-400">
                                Rs.{item.price}
                            </span>
                            <div className="flex items-center gap-4">
                                <Badge variant={item.is_available ? 'success' : 'danger'}>
                                    {item.is_available ? 'Available' : 'Unavailable'}
                                </Badge>
                                <button
                                    onClick={() => toggleAvailability(item.id)}
                                    className={`p-1 rounded-full ${item.is_available ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`}
                                >
                                    {item.is_available ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
