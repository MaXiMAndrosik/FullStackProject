import React from "react";
import { Link } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    useTheme,
    useMediaQuery,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import {
    Apartment,
    Engineering,
    Plumbing,
    Receipt,
    Calculate,
} from "@mui/icons-material";
import Features from "./Features";
import Hero from "./Hero";

const HeroPage = () => {
    const theme = useTheme();

    return (
        <>
            <Container>
                {/* Наш опыт */}
                <Card sx={{ mb: 6, p: 3 }}>
                    <CardContent>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <Engineering color="primary" sx={{ mr: 1 }} />
                            Наш опыт эксплуатации
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <Plumbing color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Круглосуточная работа инженерных систем" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <Apartment color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Своевременный ремонт общего имущества" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <Receipt color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Прозрачные финансовые отчеты перед членами кооператива" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <Calculate color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Взаимодействие с ресурсоснабжающими организациями" />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
                {/* CTA */}
            </Container>

            
            <Box
                sx={{
                    textAlign: "center",
                    p: 4,
                    borderRadius: 2,
                    // backgroundColor: theme.palette.background.paper,
                    boxShadow: 1,
                }}
            >
                <Typography variant="h6" component="p" sx={{ mb: 3 }}>
                    Работаем с 2008 года. Успешно построили и эксплуатируем
                    80-квартирный дом с 2012 года
                </Typography>
                <Button
                    component={Link}
                    to="/about"
                    variant="outlined"
                    size="large"
                    sx={{ fontWeight: "bold" }}
                >
                    Подробнее
                </Button>
            </Box>
        </>
    );
};

export default HeroPage;
