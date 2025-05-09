import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography, useTheme } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

export default function NotFoundPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Container
            maxWidth="md"
            sx={{ height: "100vh", display: "flex", alignItems: "center" }}
        >
            <Box
                sx={{
                    textAlign: "center",
                    p: 4,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.shadows[3],
                    maxWidth: 600,
                    mx: "auto",
                }}
            >
                <SentimentVeryDissatisfiedIcon
                    sx={{
                        fontSize: 80,
                        color: theme.palette.error.main,
                        mb: 2,
                    }}
                />

                <Typography
                    variant="h1"
                    sx={{ fontSize: "4rem", fontWeight: 700, mb: 2 }}
                >
                    404
                </Typography>

                <Typography variant="h5" sx={{ mb: 3 }}>
                    Страница не найдена
                </Typography>

                <Typography variant="body1" sx={{ mb: 4 }}>
                    Запрашиваемая страница не существует или была перемещена.
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate("/")}
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
        </Container>
    );
}
