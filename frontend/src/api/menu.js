import api from './axios'

export const menuAPI = {
    getCategories: () =>
        api.get('/menu/categories/'),

    getCategoriesWithItems: () =>
        api.get('/menu/categories/with_items/'),

    getCategoryById: (id) =>
        api.get(`/menu/categories/${id}/`),

    createCategory: (data) =>
        api.post('/menu/categories/', data),

    updateCategory: (id, data) =>
        api.patch(`/menu/categories/${id}/`, data),

    deleteCategory: (id) =>
        api.delete(`/menu/categories/${id}/`),

    getItems: (params = {}) =>
        api.get('/menu/items/', { params }),

    getItemById: (id) =>
        api.get(`/menu/items/${id}/`),

    createItem: (data) =>
        api.post('/menu/items/', data),

    updateItem: (id, data) =>
        api.patch(`/menu/items/${id}/`, data),

    deleteItem: (id) =>
        api.delete(`/menu/items/${id}/`),

    updatePrice: (id, price) =>
        api.post(`/menu/items/${id}/update_price/`, { price }),

    toggleAvailability: (id) =>
        api.post(`/menu/items/${id}/toggle_availability/`),

    getPopular: () =>
        api.get('/menu/items/popular/'),
}

export default menuAPI
