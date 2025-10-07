import Axios from 'axios';
import AuthService from './Auth.services';

const axiosInstance = Axios.create({
    baseURL: 'https://mcjdevsubb.fr/api',
});

// Intercepteur pour ajouter le token d'authentification dans les en-têtes
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AuthService.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
