import api from './axios'

export const ordersAPI = {
    getAll: (params = {}) =>
        api.get('/orders/', { params }),

    getById: (id) =>
        api.get(`/orders/${id}/`),

    create: (data) =>
        api.post('/orders/', data),

    update: (id, data) =>
        api.patch(`/orders/${id}/`, data),

    delete: (id) =>
        api.delete(`/orders/${id}/`),

    getActive: () =>
        api.get('/orders/active/'),

    getKitchenOrders: () =>
        api.get('/orders/kitchen/'),

    getBillingQueue: () =>
        api.get('/orders/billing_queue/'),

    addItem: (orderId, itemData) =>
        api.post(`/orders/${orderId}/add_item/`, itemData),

    updateStatus: (orderId, status, priority = null) => {
        const data = { status }
        if (priority) data.priority = priority
        return api.post(`/orders/${orderId}/update_status/`, data)
    },

    updateItemStatus: (orderId, itemId, status) =>
        api.post(`/orders/${orderId}/update_item_status/`, {
            item_id: itemId,
            status
        }),

    getInvoice: (orderId) =>
        api.get(`/orders/${orderId}/invoice/`),

    applyDiscount: (orderId, discountAmount) =>
        api.post(`/orders/${orderId}/invoice/`, {
            discount_amount: discountAmount
        }),

    getReports: () =>
        api.get('/orders/reports/'),
}

export default ordersAPI
