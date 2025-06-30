import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import apiClient from "../../../app/api/client";
import authStorage from "../../../shared/libs/authStorage";

// Инициализация состояния из хранилища
const initialState = {
    user: null,
    token: authStorage.getToken(),
    rememberMe: authStorage.getRememberMe(),
    isAuthenticated: false,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    isInitialized: false,
};

// Регистрация пользователя
export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            await apiClient.get(
                `${process.env.REACT_APP_API_URL_TOKEN}/sanctum/csrf-cookie`
            );
            const response = await apiClient.post("/auth/register", userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Registration failed" }
            );
        }
    }
);

// Вход пользователя
export const loginUser = createAsyncThunk(
    "auth/login",
    async ({ email, password, remember }, { rejectWithValue }) => {
        try {
            await apiClient.get(
                `${process.env.REACT_APP_API_URL_TOKEN}/sanctum/csrf-cookie`
            );
            const response = await apiClient.post("/auth/login", {
                email,
                password,
            });

            return {
                user: response.data.user,
                token: response.data.token,
                remember,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Login failed" }
            );
        }
    }
);

// Выход пользователя
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await apiClient.post("/auth/logout");
            return true;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Logout failed" }
            );
        }
    }
);

// Получение текущего пользователя
export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchUser",
    async (_, { dispatch,rejectWithValue }) => {
        try {
            const response = await apiClient.get("/user");
            return response.data;
        } catch (error) {
            if (error.payload?.status === 401) {
                dispatch(clearAuth());
            }
            return rejectWithValue(error.response?.data);
        }
    }
);

// Инициализация аутентификации
export const initializeAuth = createAsyncThunk(
    "auth/initialize",
    async (_, { dispatch, getState }) => {
        const { token } = getState().auth;

        if (token) {
            try {
                await dispatch(fetchCurrentUser()).unwrap();
                return true;
            } catch (error) {
                authStorage.clearAuth();
                if (error.payload?.status === 401) {
                    dispatch(clearAuth());
                }
                return false;
            }
        }
        return false;
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setRememberMe: (state, action) => {
            state.rememberMe = action.payload;
            authStorage.setRememberMe(action.payload);
        },
        clearAuth: (state) => {
            authStorage.clearAuth();
            Object.assign(state, initialState);
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.status = "idle";
            state.isInitialized = true;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;

            // Сохраняем в хранилище, если нужно
            if (state.rememberMe) {
                localStorage.setItem("auth_token", token);
            } else {
                sessionStorage.setItem("auth_token", token);
            }
        },
        markInitialized: (state) => {
            state.isInitialized = true;
        },
        forceLogout: (state) => {
            authStorage.clearAuth();
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.status = "idle";
        },
    },
    extraReducers: (builder) => {
        builder
            // Успешная регистрация
            .addCase(registerUser.fulfilled, (state) => {
                state.status = "succeeded";
            })

            // Успешный вход
            .addCase(loginUser.fulfilled, (state, action) => {
                const { user, token, remember } = action.payload;
                state.user = user;
                state.token = token;
                state.rememberMe = remember;
                state.isAuthenticated = true;
                state.status = "succeeded";
                state.error = null;
                authStorage.setToken(token, remember);
                authStorage.setRememberMe(remember);
            })

            // Успешный выход
            .addCase(logoutUser.fulfilled, (state) => {
                authStorage.clearAuth();
                Object.assign(state, initialState);
                state.isInitialized = true;
            })

            // Получение данных пользователя
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isInitialized = true;
                state.status = "succeeded";
                state.error = null;
            })

            // Инициализация
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.isAuthenticated = action.payload;
                state.isInitialized = true;
                if (action.payload && !state.user) {
                    state.status = "loading";
                }
            });

        // Обработка состояний загрузки
        builder.addMatcher(
            isAnyOf(
                registerUser.pending,
                loginUser.pending,
                logoutUser.pending,
                fetchCurrentUser.pending,
                initializeAuth.pending
            ),
            (state) => {
                state.status = "loading";
                state.error = null;
            }
        );

        // Обработка ошибок
        builder.addMatcher(
            isAnyOf(
                registerUser.rejected,
                loginUser.rejected,
                logoutUser.rejected,
                fetchCurrentUser.rejected,
                initializeAuth.rejected
            ),
            (state, action) => {
                state.status = "failed";
                state.error = {
                    message: action.payload?.message || "An error occurred",
                    details: action.payload?.errors || null,
                };

                // Автоматический выход при 401 ошибке
                if (action.payload?.status === 401) {
                    authStorage.clearAuth();
                    state.token = null;
                    state.isAuthenticated = false;
                }
            }
        );
    },
});

// Селекторы
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role || null;
export const selectIsAdmin = (state) => state.auth.user?.role === "admin";
export const selectIsOwner = (state) => state.auth.user?.role === "owner";
export const selectIsUser = (state) => state.auth.user?.role === "user";
export const selectAuthError = (state) => state.auth.error;
export const selectRememberMe = (state) => state.auth.rememberMe;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectAuthStatus = (state) => state.auth.status;

// Экшены
export const {
    setRememberMe,
    clearAuth,
    clearAuthError,
    setCredentials,
    markInitialized,
} = authSlice.actions;

export default authSlice.reducer;
