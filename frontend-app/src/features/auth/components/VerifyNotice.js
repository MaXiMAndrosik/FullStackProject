import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Link, Container } from "@mui/material";

export default function VerifyNotice() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "ваш email";

    useEffect(() => {
        if (!email) {
            navigate("/register");
        }
    }, [email, navigate]);

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
                    minHeight: "50vh",
                    pt: { xs: 4, sm: 8 },
                    pb: { xs: 4, sm: 8 },
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
                    Проверьте вашу
                    <Typography
                        component="span"
                        variant="h2"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                    >
                        почту
                    </Typography>
                </Typography>

                <Typography variant="body1" sx={{ mb: 3 }}>
                    Мы отправили ссылку для подтверждения на{" "}
                    <strong>{email}</strong>.
                </Typography>

                <Typography variant="body2" sx={{ mb: 4 }}>
                    Если письмо не пришло, проверьте папку "Спам" или
                    <Button
                        onClick={() => navigate("/resend-verification")}
                        sx={{ ml: 1 }}
                    >
                        отправьте письмо повторно
                    </Button>
                </Typography>

                <Link href="/login" variant="body2">
                    Вернуться на страницу входа
                </Link>
            </Container>
        </Box>
    );
}
