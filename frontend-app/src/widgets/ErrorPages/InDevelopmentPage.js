import React from "react";
import { Box, Button, Container, Typography, useTheme } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { Link as RouterLink } from "react-router-dom";

export default function InDevelopmentPage() {
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
                <EngineeringIcon
                    sx={{
                        fontSize: 80,
                        color: theme.palette.error.main,
                        mb: 2,
                    }}
                />
                <Typography
                    variant="h5"
                    sx={{ mb: 3, color: "text.secondary" }}
                >
                    Страница находится в разработке
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
