import { useState, useEffect } from 'react'
import { inventoryAPI } from '../../api/inventory'
import { Card, Button, Input, Badge, Loading, Modal } from '../../components/common/UI'
import {
    Package,
    Search,
    Plus,
    Minus,
    AlertTriangle,
    History,
    RefreshCw
} from 'lucide-react'

export default function InventoryManagement() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [transactions, setTransactions] = useState([])

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)

    // Forms
    const [updateForm, setUpdateForm] = useState({ amount: '', reason: 'purchase', notes: '' })
    const [createForm, setCreateForm] = useState({ name: '', quantity: '0', unit: 'kg', low_stock_threshold: '5', cost_per_unit: '0' })
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchInventory()
    }, [])

    const fetchInventory = async () => {
        try {
            const response = await inventoryAPI.getAll()
            setItems(response.data.results || [])
        } catch (err) {
            console.error('Failed to fetch inventory:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateItem = async () => {
        setProcessing(true)
        try {
            await inventoryAPI.create(createForm)
            await fetchInventory()
            setShowCreateModal(false)
            setCreateForm({ name: '', quantity: '0', unit: 'kg', low_stock_threshold: '5', cost_per_unit: '0' })
        } catch (err) {
            console.error('Failed to create item:', err)
            alert('Failed to create item')
        } finally {
            setProcessing(false)
        }
    }

    const handleUpdateStock = (item) => {
        setSelectedItem(item)
        setUpdateForm({ amount: '', reason: 'purchase', notes: '' })
        setShowUpdateModal(true)
    }

    const submitStockUpdate = async () => {
        if (!updateForm.amount || isNaN(updateForm.amount)) return

        setProcessing(true)
        try {
            let change = parseFloat(updateForm.amount)
            if (['usage', 'waste'].includes(updateForm.reason)) {
                change = -change
            }

            await inventoryAPI.updateStock(
                selectedItem.id,
                change,
                updateForm.reason,
                updateForm.notes
            )

            await fetchInventory()
            setShowUpdateModal(false)
        } catch (err) {
            console.error('Update failed:', err)
            alert('Failed to update stock')
        } finally {
            setProcessing(false)
        }
    }

    const viewHistory = async (item) => {
        setSelectedItem(item)
        setShowHistoryModal(true)
        try {
            const response = await inventoryAPI.getHistory(item.id)
            setTransactions(response.data.results || [])
        } catch (err) {
            console.error('Failed to fetch history:', err)
        }
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <Loading />

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
                    <p className="text-secondary-400">Track and update stock levels</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchInventory} variant="secondary">
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Item
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="max-w-md">
                <Input
                    icon={Search}
                    placeholder="Search ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Inventory Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => (
                    <Card
                        key={item.id}
                        className={`relative border-2 transition-all ${item.is_low_stock ? 'border-red-500/50 bg-red-500/5' : 'border-transparent'
                            }`}
                    >
                        {item.is_low_stock && (
                            <div className="absolute top-4 right-4 text-red-400 animate-pulse" title="Low Stock">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary-800 flex items-center justify-center text-primary-400">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                                <p className="text-sm text-secondary-400">
                                    Threshold: {item.low_stock_threshold} {item.unit}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-3xl font-bold text-white">
                                {item.quantity}
                                <span className="text-lg text-secondary-500 ml-1 font-normal">{item.unit}</span>
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleUpdateStock(item)}
                            >
                                Update Stock
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="px-2"
                                onClick={() => viewHistory(item)}
                            >
                                <History className="w-5 h-5" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create Item Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Add New Inventory Item"
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Item Name</label>
                        <Input
                            value={createForm.name}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Tomatoes"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Initial Quantity</label>
                            <Input
                                type="number"
                                value={createForm.quantity}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, quantity: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Unit</label>
                            <select
                                className="input"
                                value={createForm.unit}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, unit: e.target.value }))}
                            >
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="l">l</option>
                                <option value="ml">ml</option>
                                <option value="pcs">pcs</option>
                                <option value="box">box</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Low Stock Threshold</label>
                            <Input
                                type="number"
                                value={createForm.low_stock_threshold}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, low_stock_threshold: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Cost Per Unit</label>
                            <Input
                                type="number"
                                value={createForm.cost_per_unit}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, cost_per_unit: e.target.value }))}
                            />
                        </div>
                    </div>
                    <Button
                        fullWidth
                        onClick={handleCreateItem}
                        loading={processing}
                        disabled={!createForm.name}
                    >
                        Create Item
                    </Button>
                </div>
            </Modal>

            {/* Update Stock Modal */}
            <Modal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                title={`Update Stock: ${selectedItem?.name}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Action Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setUpdateForm(prev => ({ ...prev, reason: 'purchase' }))}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all
                                    ${updateForm.reason === 'purchase' || updateForm.reason === 'correction'
                                        ? 'bg-green-500/20 border-green-500 text-green-400'
                                        : 'border-secondary-700 text-secondary-400'}`}
                            >
                                <Plus className="w-4 h-4" /> Add / Restock
                            </button>
                            <button
                                onClick={() => setUpdateForm(prev => ({ ...prev, reason: 'usage' }))}
                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all
                                    ${['usage', 'waste'].includes(updateForm.reason)
                                        ? 'bg-red-500/20 border-red-500 text-red-400'
                                        : 'border-secondary-700 text-secondary-400'}`}
                            >
                                <Minus className="w-4 h-4" /> Remove / Use
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="label">Reason Category</label>
                        <select
                            className="input"
                            value={updateForm.reason}
                            onChange={(e) => setUpdateForm(prev => ({ ...prev, reason: e.target.value }))}
                        >
                            <option value="purchase">Purchase (Restock)</option>
                            <option value="usage">Usage (Kitchen)</option>
                            <option value="waste">Waste / Spoilage</option>
                            <option value="correction">Inventory Correction</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Amount ({selectedItem?.unit})</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={updateForm.amount}
                            onChange={(e) => setUpdateForm(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="label">Notes (Optional)</label>
                        <Input
                            value={updateForm.notes}
                            onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Supplier info, batch number, etc."
                        />
                    </div>

                    <Button
                        fullWidth
                        onClick={submitStockUpdate}
                        loading={processing}
                        disabled={!updateForm.amount}
                    >
                        Confirm Update
                    </Button>
                </div>
            </Modal>

            {/* History Modal */}
            <Modal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                title="Stock History"
            >
                <div className="max-h-96 overflow-y-auto space-y-3">
                    {transactions.length === 0 ? (
                        <p className="text-secondary-400 text-center py-4">No history found.</p>
                    ) : (
                        transactions.map(txn => (
                            <div key={txn.id} className="flex justify-between items-center p-3 rounded-lg bg-secondary-800">
                                <div>
                                    <p className="text-white font-medium capitalize">{txn.reason.replace('_', ' ')}</p>
                                    <p className="text-xs text-secondary-400">
                                        {new Date(txn.created_at).toLocaleDateString()} by {txn.created_by_name}
                                    </p>
                                    {txn.notes && <p className="text-xs text-secondary-500 italic mt-1">"{txn.notes}"</p>}
                                </div>
                                <div className={`font-bold ${txn.change_amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {txn.change_amount > 0 ? '+' : ''}{txn.change_amount}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>
    )
}
