import axios from "axios";
import { store } from "../store/store";
import { showError } from "../../shared/services/notificationService";

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    withCredentials: true, // Важно для Sanctum
});

// Логирование только в development
if (process.env.NODE_ENV === "development") {
    // Логирование запросов
    apiClient.interceptors.request.use((config) => {
        console.log("Отправка запроса:", {
            method: config.method,
            url: config.url,
            data: config.data,
            headers: config.headers,
        });
        return config;
    });
    // Логирование ответов
    apiClient.interceptors.response.use(
        (response) => {
            console.log("Response:", response);
            return response;
        },
        (error) => {
            console.error("Error:", error);
            return Promise.reject(error);
        }
    );
}

// Обработчик для автоматической аутентификации
let csrfToken = null;
apiClient.interceptors.request.use(async (config) => {
    // Пропускаем CSRF-запросы
    if (config.url?.includes("/sanctum/csrf-cookie")) {
        return config;
    }

    // Добавляем токен из хранилища, если есть
    const token = store.getState().auth.token;
    if (token && !config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Добавляем X-XSRF-TOKEN из запроса
    if (
        !csrfToken &&
        ["post", "put", "patch", "delete"].includes(
            config.method?.toLowerCase()
        )
    ) {
        await axios.get(
            `${process.env.REACT_APP_API_URL_TOKEN}/sanctum/csrf-cookie`,
            {
                withCredentials: true,
            }
        );
        csrfToken = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
    }

    if (csrfToken) {
        config.headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
    }

    return config;
});

// Обработка ошибок
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Обработка 419 ошибки (CSRF token expired)
        if (error.response?.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;
            await axios.get(
                `${process.env.REACT_APP_API_URL_TOKEN}/sanctum/csrf-cookie`,
                {
                    withCredentials: true,
                    headers: { "Cache-Control": "no-cache" },
                }
            );
            return apiClient(originalRequest);
        }

        // Обработка 401 ошибки (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await axios.get(
                    `${process.env.REACT_APP_API_URL_TOKEN}/sanctum/csrf-cookie`,
                    { withCredentials: true }
                );
                return apiClient(originalRequest);
            } catch (refreshError) {
                showError(error);
                store.dispatch({ type: "auth/clearAuth" });
                return Promise.reject(refreshError);
            }
        }

        // Обработка 403 ошибки (Forbidden)
        if (error.response?.status === 403) {
            showError(error);
            // navigate("/forbidden");
            return Promise.reject(error);
        }

        // Обработка других ошибок
        if (error.response) {
            showError(error);
        } else {
            showError(error);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
