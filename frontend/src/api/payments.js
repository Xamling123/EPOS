import api from './axios'

export const paymentsAPI = {
    getAll: (params = {}) =>
        api.get('/payments/', { params }),

    getById: (id) =>
        api.get(`/payments/${id}/`),

    create: (data) =>
        api.post('/payments/', data),

    complete: (id) =>
        api.post(`/payments/${id}/complete/`),

    refund: (id) =>
        api.post(`/payments/${id}/refund/`),

    mockGateway: (data) =>
        api.post('/payments/mock_gateway/', data),

    getSummary: () =>
        api.get('/payments/summary/'),
    
    // eSewa Payment Methods
    esewaInitiate: (orderId) =>
        api.post('/payments/esewa_initiate/', { order_id: orderId }),
    
    esewaVerify: (verificationData) =>
        api.post('/payments/esewa_verify/', verificationData),
}

export default paymentsAPI

