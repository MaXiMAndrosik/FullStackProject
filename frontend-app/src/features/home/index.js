import Features from "./components/Features";
import Hero from "./components/Hero";
import { Link } from "react-router-dom";
import { Container, Typography, Box, Button } from "@mui/material";

export default function HomePage() {
    return (
        <>
            <Hero />
            <Features />
            <Container
                sx={{
                    alignItems: "center",
                    pt: { xs: 4, sm: 8 },
                    pb: { xs: 4, sm: 8 },
                }}
            >
                <Box
                    sx={(theme) => ({
                        textAlign: "center",
                        p: 4,
                        borderRadius: 2,
                        color: "primary.contrastText",
                        backgroundColor: "primary.main",
                        ...theme.applyStyles("dark", {
                            backgroundColor: "hsl(210, 100%, 16%)",
                        }),
                    })}
                >
                    <Typography variant="h6" component="p" sx={{ mb: 3 }}>
                        Работаем с 2007 года. Успешно построили и эксплуатируем
                        80-квартирный дом с 2012 года.
                    </Typography>
                    <Button
                        component={Link}
                        to="/about"
                        variant="contained"
                        size="large"
                        sx={{ fontWeight: "bold" }}
                    >
                        Подробнее
                    </Button>
                </Box>
            </Container>
        </>
    );
}
