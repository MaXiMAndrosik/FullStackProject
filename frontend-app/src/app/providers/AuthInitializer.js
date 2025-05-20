import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    initializeAuth,
    selectIsAuthenticated,
    selectIsInitialized,
} from "../../features/auth/model/authSlice";

export const AuthInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isInitialized = useSelector(selectIsInitialized);

    useEffect(() => {
        if (!isInitialized) {
            dispatch(initializeAuth());
        }
    }, []);

    return children;
};
