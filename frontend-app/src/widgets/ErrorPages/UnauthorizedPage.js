import {
    Container,
    Box,
    Button,
    Typography,
    useTheme,
    Link,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import HomeIcon from "@mui/icons-material/Home";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import LockPersonIcon from "@mui/icons-material/LockPerson";

export default function UnauthorizedPage() {
    const theme = useTheme();
    const location = useLocation();
    const from = location.state?.from || "/";

    return (
        <Container
            maxWidth="md"
            sx={{
                height: "60vh",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Box
                sx={{
                    textAlign: "center",
                    p: 4,
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                    boxShadow: theme.shadows[3],
                    maxWidth: 600,
                    mx: "auto",
                }}
            >
                <LockPersonIcon
                    sx={{
                        fontSize: 80,
                        color: theme.palette.error.main,
                        mb: 2,
                    }}
                />
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: "4rem",
                        fontWeight: 700,
                        mb: 2,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: `0 2px 4px rgba(0,0,0,0.1)`,
                        color: "text.secondary",
                    }}
                >
                    401
                </Typography>
                <Typography
                    variant="h5"
                    sx={{ mb: 3, color: "text.secondary" }}
                >
                    Доступ ограничен
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ mb: 4, color: "text.secondary" }}
                >
                    Пожалуйста, авторизуйтесь для просмотра этой страницы
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "center",
                        mb: 4,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        component={RouterLink}
                        to="/login"
                        state={{ from }}
                        variant="contained"
                        size="large"
                        startIcon={<LoginIcon />}
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: "1rem",
                            borderRadius: 2,
                        }}
                    >
                        Войти в систему
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<HomeIcon />}
                        component={RouterLink}
                        to="/"
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: "1rem",
                            borderRadius: 2,
                        }}
                    >
                        На главную
                    </Button>
                </Box>

                <Typography
                    variant="body1"
                    sx={{
                        mt: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.palette.text.primary,
                    }}
                >
                    Ещё не с нами?{" "}
                    <Link
                        component={RouterLink}
                        to="/register"
                        sx={{
                            ml: 1,
                            display: "inline-flex",
                            alignItems: "center",
                            color: theme.palette.secondary.main,
                            fontWeight: 500,
                            "&:hover": {
                                color: theme.palette.secondary.dark,
                            },
                        }}
                    >
                        <HowToRegIcon sx={{ mr: 0.5 }} />
                        Создать аккаунт
                    </Link>
                </Typography>
            </Box>
        </Container>
    );
}
