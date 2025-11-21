import axios from 'axios'

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
})

api.interceptors.request.use(
    (res) => res,
    (err) => {
        return Promise.reject(err)
    }
)
