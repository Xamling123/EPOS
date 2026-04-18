import api from './axios'

export const authAPI = {
    login: (email, password) =>
        api.post('/auth/login/', { email, password }),

    register: (userData) =>
        api.post('/auth/register/', userData),

    refreshToken: (refresh) =>
        api.post('/auth/refresh/', { refresh }),

    getProfile: () =>
        api.get('/auth/profile/'),

    updateProfile: (data) =>
        api.patch('/auth/profile/', data),

    changePassword: (oldPassword, newPassword) =>
        api.post('/auth/change-password/', {
            old_password: oldPassword,
            new_password: newPassword
        }),
}

export default authAPI
