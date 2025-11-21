import {api} from './client'

export const login = async  (id, pswd) => {
    const {data} = await api.post('/auth/login', {id, pswd})
    return data
}

export const me = async () => {
    const {data} = await api.get('/auth/me')
    return data
}

export const logout = async () => {
    const {data} = await api.post('/auth/logout')
    return data
}
