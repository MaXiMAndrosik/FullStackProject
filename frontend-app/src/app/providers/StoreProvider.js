import { Provider } from "react-redux";
import { store } from "../store/store";
import { AuthInitializer } from "./AuthInitializer";

export const StoreProvider = ({ children }) => {
    if (process.env.NODE_ENV === "development" && !store) {
        throw new Error("Redux store not initialized!");
    }
    return (
        <Provider store={store}>
            <AuthInitializer>{children}</AuthInitializer>
        </Provider>
    );
};
