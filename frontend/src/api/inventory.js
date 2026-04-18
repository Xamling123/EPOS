import api from './axios'

export const inventoryAPI = {
    getAll: (params = {}) =>
        api.get('/inventory/', { params }),

    getById: (id) =>
        api.get(`/inventory/${id}/`),

    create: (data) =>
        api.post('/inventory/', data),

    update: (id, data) =>
        api.patch(`/inventory/${id}/`, data),

    delete: (id) =>
        api.delete(`/inventory/${id}/`),

    updateStock: (id, changeAmount, reason, notes = '') =>
        api.post(`/inventory/${id}/update_stock/`, {
            change_amount: changeAmount,
            reason,
            notes
        }),

    getHistory: (id) =>
        api.get(`/inventory/${id}/history/`),
}

export default inventoryAPI
