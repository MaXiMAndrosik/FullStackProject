import { logger } from "redux-logger";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/model/authSlice";

const localStorageMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    // Сохраняем ВСЕ нужные части состояния (cart + delivery)
    const state = store.getState();
    const persistedState = {
        delivery: state.delivery, // Состояние доставки
        auth: state.auth, // Состояние доставки
    };

    localStorage.setItem("reduxState", JSON.stringify(persistedState));

    // localStorage.setItem("cartState", JSON.stringify(store.getState().cart));
    return result;
};

// Загрузка из localStorage
const preloadedState = () => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("reduxState");
        return saved ? JSON.parse(saved) : undefined;

        // const savedCart = localStorage.getItem("cartState");
        // return savedCart ? { cart: JSON.parse(savedCart) } : undefined;
    }
};

export const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem("reduxState", serializedState);
        // localStorage.setItem("cartState", serializedState);
    } catch {
        // ignore errors
    }
};

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        // getDefaultMiddleware().concat(logger, localStorageMiddleware),
        getDefaultMiddleware().concat(localStorageMiddleware),
    preloadedState: preloadedState(),
});

// store.subscribe(() => {
//     saveState({
//         // cart: store.getState().cart,
//         cart: store.getState(),
//     });
// });

export default store;
