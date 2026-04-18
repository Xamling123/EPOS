import api from './axios'

export const reservationsAPI = {
    getAll: (params = {}) =>
        api.get('/reservations/', { params }),

    getById: (id) =>
        api.get(`/reservations/${id}/`),

    create: (data) =>
        api.post('/reservations/', data),

    update: (id, data) =>
        api.patch(`/reservations/${id}/`, data),

    delete: (id) =>
        api.delete(`/reservations/${id}/`),

    getMyReservations: () =>
        api.get('/reservations/my_reservations/'),

    getUpcoming: () =>
        api.get('/reservations/upcoming/'),

    getToday: () =>
        api.get('/reservations/today/'),

    updateStatus: (id, status) =>
        api.post(`/reservations/${id}/update_status/`, { status }),

    cancel: (id) =>
        api.post(`/reservations/${id}/cancel/`),
}

export default reservationsAPI
