// src/shared/libs/authStorage.js

const AuthStorage = {
    setToken: (token, remember) => {
        try {
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem("auth_token", token);

            // Очищаем из другого хранилища
            if (remember) {
                sessionStorage.removeItem("auth_token");
            } else {
                localStorage.removeItem("auth_token");
            }
        } catch (e) {
            console.error("Storage error:", e);
        }
    },

    getToken: () => {
        try {
            // Сначала проверяем sessionStorage
            return (
                sessionStorage.getItem("auth_token") ||
                localStorage.getItem("auth_token")
            );
        } catch (e) {
            console.error("Storage error:", e);
            return null;
        }
    },

    clearAuth: () => {
        try {
            ["auth_token", "rememberMe"].forEach((key) => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
        } catch (e) {
            console.error("Storage error:", e);
        }
    },

    getRememberMe: () => {
        try {
            return localStorage.getItem("rememberMe") === "true";
        } catch (e) {
            console.error("Storage error:", e);
            return false;
        }
    },

    setRememberMe: (value) => {
        try {
            if (value) {
                localStorage.setItem("rememberMe", "true");
            } else {
                localStorage.removeItem("rememberMe");
            }
        } catch (e) {
            console.error("Storage error:", e);
        }
    },
};

export default AuthStorage;
