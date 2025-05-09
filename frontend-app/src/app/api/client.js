import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            return Promise.reject({
                message: error.response.data.message || "Ошибка сервера",
                status: error.response.status,
            });
        }
        return Promise.reject(error);
    }
);

export default apiClient;
