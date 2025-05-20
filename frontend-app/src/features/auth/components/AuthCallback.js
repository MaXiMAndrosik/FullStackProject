import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { Box, Paper, CircularProgress, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setCredentials } from "../model/authSlice";
import authStorage from "../../../shared/libs/authStorage"; // Импортируем наш storage-хелпер

const fetchCurrentUser = async (token = null) => {
    try {
        const config = token
            ? {
                  headers: {
                      Authorization: `Bearer ${token}`,
                      Accept: "application/json",
                  },
              }
            : { withCredentials: true };

        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/user`,
            config
        );
        return response.data;
    } catch (error) {
        console.error("User fetch error:", error);
        throw error;
    }
};

export default function AuthCallback() {
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleAuth = async () => {
            const token = searchParams.get("token");
            const isDevMode = process.env.NODE_ENV === "development";

            try {
                // Искусственная задержка для разработки (2 секунды)
                if (isDevMode) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }

                // Если есть токен из верификации - используем его
                if (token) {
                    authStorage.setToken(token, false);
                    axios.defaults.headers.common[
                        "Authorization"
                    ] = `Bearer ${token}`;
                }

                const user = await fetchCurrentUser(token);

                // Диспатчим данные пользователя в Redux store
                dispatch(
                    setCredentials({
                        user,
                        token: token || localStorage.getItem("auth_token"),
                    })
                );

                // Дополнительная задержка перед перенаправлением в dev-режиме
                if (isDevMode) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                // Перенаправляем в основное приложение
                navigate("/", { replace: true });
            } catch (error) {
                console.error("Auth failed:", error);
                navigate("/login", {
                    state: { error: "Ошибка авторизации" },
                    replace: true,
                });
            }
        };

        handleAuth();
    }, [navigate, searchParams, dispatch]);

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "40vh",
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    maxWidth: 400,
                    width: "100%",
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "grey.800"
                            : "background.paper",
                }}
            >
                <CircularProgress
                    size={60}
                    thickness={4}
                    sx={{ mb: 3, color: theme.palette.primary.main }}
                />
                <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                >
                    Проверка авторизации
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Пожалуйста, подождите...
                </Typography>
                {process.env.NODE_ENV === "development" && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                    >
                        Режим разработки (искусственная задержка)
                    </Typography>
                )}
            </Paper>
        </Box>
    );
}
