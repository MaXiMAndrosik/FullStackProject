import React from "react";
import { Box, Button, Container, Typography, useTheme } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { Link as RouterLink } from "react-router-dom";


export default function NotFoundPage() {
    const theme = useTheme();

    return (
        <Container
            maxWidth="md"
            sx={{ height: "60vh", display: "flex", alignItems: "center" }}
        >
            <Box
                sx={{
                    textAlign: "center",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: theme.shadows[3],
                    maxWidth: 600,
                    mx: "auto",
                    backgroundColor: "background.paper",
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
                    404
                </Typography>
                <Typography
                    variant="h5"
                    sx={{ mb: 3, color: "text.secondary" }}
                >
                    Страница не найдена
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ mb: 4, color: "text.secondary" }}
                >
                    Запрашиваемая страница не существует или была перемещена.
                </Typography>
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
                    }}
                >
                    На главную
                </Button>
            </Box>
        </Container>
    );
}
