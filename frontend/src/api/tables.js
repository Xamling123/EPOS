import api from './axios'

export const tablesAPI = {
    getAll: () =>
        api.get('/tables/'),

    getById: (id) =>
        api.get(`/tables/${id}/`),

    create: (data) =>
        api.post('/tables/', data),

    update: (id, data) =>
        api.patch(`/tables/${id}/`, data),

    delete: (id) =>
        api.delete(`/tables/${id}/`),

    checkAvailability: (date, startTime, endTime, guestCount) =>
        api.post('/tables/availability/', {
            date,
            start_time: startTime,
            end_time: endTime,
            guest_count: guestCount,
        }),

    updateStatus: (id, status) =>
        api.post(`/tables/${id}/update_status/`, { status }),
}

export default tablesAPI
