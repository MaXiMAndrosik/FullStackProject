import React from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Paper,
} from "@mui/material";
import {
    Info as InfoIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    VpnKey as KeyIcon,
    Home as HomeIcon,
} from "@mui/icons-material";

const AuthSideContent = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                p: 4,
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: 2,
                backdropFilter: "blur(5px)",
            }}
        >
            <Box sx={{ mb: 4, textAlign: "center" }}>
                {/* <HomeIcon sx={{ fontSize: 60, color: "primary.main" }} /> */}
                <Typography variant="h4" sx={{ mt: 2, fontWeight: "bold" }}>
                    ЖСПК Зенитчик-4 Сервис
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Тестовая версия приложения
                </Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    backgroundColor: "primary.light",
                    color: "primary.contrastText",
                    borderRadius: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <InfoIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Тестовый период</Typography>
                </Box>
                <Typography variant="body2">
                    Приложение находится в тестовом режиме. Вы можете опробовать
                    функционал с различными ролями пользователей.
                </Typography>
            </Paper>

            <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
            >
                <PersonIcon sx={{ mr: 1 }} />
                Доступные тестовые аккаунты
            </Typography>

            <List dense sx={{ mb: 2 }}>
                <ListItem>
                    <ListItemIcon>
                        <AdminIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Администратор"
                        secondary={
                            <Box component="span">
                                <Box component="span" sx={{ display: "block" }}>
                                    Email: admin@example.com
                                </Box>
                                <Box component="span" sx={{ display: "block" }}>
                                    Пароль: password
                                </Box>
                            </Box>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                    />
                </ListItem>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItem>
                    <ListItemIcon>
                        <HomeIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Собственник квартиры"
                        secondary={
                            <Box component="span">
                                <Box component="span" sx={{ display: "block" }}>
                                    Email: owner@example.com
                                </Box>
                                <Box component="span" sx={{ display: "block" }}>
                                    Пароль: password
                                </Box>
                            </Box>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                    />
                </ListItem>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItem>
                    <ListItemIcon>
                        <PersonIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Обычный пользователь"
                        secondary={
                            <Box component="span">
                                <Box component="span" sx={{ display: "block" }}>
                                    Email: user@example.com
                                </Box>
                                <Box component="span" sx={{ display: "block" }}>
                                    Пароль: password
                                </Box>
                            </Box>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                    />
                </ListItem>
            </List>

            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    backgroundColor: "warning.light",
                    color: "warning.contrastText",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <KeyIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                    Все тестовые аккаунты используют один пароль:{" "}
                    <strong>password</strong>
                </Typography>
            </Paper>
        </Box>
    );
};

export default AuthSideContent;
