import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Alert, Container } from "@mui/material";
import apiClient from "../../../app/api/client";

export default function ResendVerification() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResend = async () => {
        setLoading(true);
        try {
            const email =
                localStorage.getItem("verification_email") ||
                prompt("Пожалуйста, введите ваш email:");

            if (!email) {
                setError("Email обязателен для отправки письма");
                return;
            }

            await apiClient.post("/email/resend", { email });

            await apiClient.post("/email/resend", { email });
            setMessage("Новая ссылка отправлена на ваш email");
            // setTimeout(() => navigate("/"), 5000);
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка при отправке");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={(theme) => ({
                width: "100%",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
                ...theme.applyStyles("dark", {
                    backgroundImage:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
                }),
            })}
        >
            <Container
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "60vh",
                    p: 4,
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        textAlign: "center",
                        mb: 2,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                    }}
                >
                    Ссылка верификации
                    <Typography
                        component="span"
                        variant="h2"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                    >
                        истекла
                    </Typography>
                </Typography>

                <Typography variant="body1" sx={{ mb: 3 }}>
                    Срок действия вашей ссылки истёк. Пожалуйста, запросите
                    новое письмо для подтверждения email.
                </Typography>

                {message && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {message}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Button
                    variant="contained"
                    onClick={handleResend}
                    disabled={loading}
                    sx={{ mb: 3 }}
                >
                    {loading ? "Отправка..." : "Отправить письмо повторно"}
                </Button>

                <Button onClick={() => navigate("/login")}>
                    Вернуться на страницу входа
                </Button>
            </Container>
        </Box>
    );
}
