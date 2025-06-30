import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import {
    selectIsAdmin,
    selectIsOwner,
    selectIsUser,
    selectIsInitialized,
    selectAuthStatus,
} from "../../features/auth/model/authSlice";
import { Box, Typography } from "@mui/material";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const isAdmin = useSelector(selectIsAdmin);
    const isOwner = useSelector(selectIsOwner);
    const isUser = useSelector(selectIsUser);
    const isInitialized = useSelector(selectIsInitialized);
    const status = useSelector(selectAuthStatus);

    // Пока данные загружаются
    if (!isInitialized || status === "loading") {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <Typography variant="h6">Проверка прав доступа...</Typography>
            </Box>
        );
    }

    // Определяем доступные роли
    const isAllowed = () => {
        if (allowedRoles.includes("admin") && isAdmin) return true;
        if (allowedRoles.includes("owner") && isOwner) return true;
        if (allowedRoles.includes("user") && isUser) return true;
        return false;
    };

    if (!isAllowed()) {
        return <Navigate to="/forbidden" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
