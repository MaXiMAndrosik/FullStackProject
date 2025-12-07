import { logger } from "redux-logger";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/model/authSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    "auth/register/fulfilled",
                    "auth/login/fulfilled",
                ],
                ignoredPaths: ["auth.user"],
            },
        }).concat(
            // process.env.NODE_ENV === "development" ? logger : []
            process.env.REACT_APP_ENABLE_REDUX_LOGGER === 'true' ? logger : []
        ),
});

store.subscribe(() => {
    const state = store.getState();
    localStorage.setItem(
        "auth_meta",
        JSON.stringify({
            isAuthenticated: state.auth.isAuthenticated,
            lastUserEmail: state.auth.user?.email,
        })
    );
});

// Сохраняем ВСЕ данные из auth-слайса для debug
store.subscribe(() => {
    const state = store.getState();

    localStorage.setItem(
        "auth_debug",
        JSON.stringify({
            fullAuthState: state.auth, // Сохраняем ВСЕ данные из auth-слайса
            timestamp: new Date().toISOString(),
        })
    );
});

export default store;
