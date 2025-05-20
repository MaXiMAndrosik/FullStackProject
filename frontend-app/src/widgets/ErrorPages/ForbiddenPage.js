import { Container, Box, Button, Typography, useTheme } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb"; // Новая иконка

export default function ForbiddenPage() {
    const theme = useTheme();

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
                <DoNotDisturbIcon
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
                    403
                </Typography>
                <Typography
                    variant="h5"
                    sx={{ mb: 3, color: "text.secondary" }}
                >
                    Доступ запрещён
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ mb: 4, color: "text.secondary" }}
                >
                    У вашей учетной записи недостаточно прав для просмотра этой
                    страницы
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
                        variant="contained"
                        size="large"
                        startIcon={<HomeIcon />}
                        component={RouterLink}
                        to="/"
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: "1rem",
                            borderRadius: 2,
                            bgcolor: theme.palette.error.main,
                            "&:hover": {
                                bgcolor: theme.palette.error.dark,
                            },
                        }}
                    >
                        На главную
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<ContactSupportIcon />}
                        component={RouterLink}
                        to="/feedback"
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: "1rem",
                            borderRadius: 2,
                        }}
                    >
                        Поддержка
                    </Button>
                </Box>

                <Typography
                    variant="body2"
                    sx={{
                        mt: 2,
                        color: theme.palette.text.secondary,
                    }}
                >
                    Если вам нужен доступ, обратитесь к администратору системы
                </Typography>
            </Box>
        </Container>
    );
}
