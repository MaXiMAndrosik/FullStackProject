import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    initializeAuth,
    selectIsInitialized,
} from "../../features/auth/model/authSlice";

export const AuthInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const isInitialized = useSelector(selectIsInitialized);
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        if (token && !isInitialized) {
            dispatch(initializeAuth());
        } else if (!token) {
            dispatch({
                type: "auth/markInitialized",
                payload: true,
            });
        }
    }, [dispatch, token, isInitialized]);

    return children;
};
