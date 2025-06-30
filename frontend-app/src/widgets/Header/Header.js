import * as React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useAds } from "../../app/providers/AdContext";
import Stack from "@mui/material/Stack";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import UserMenu from "./UserMenu";
import MenuButton from "../../shared/ui/MenuButton";
import ColorModeIconDropdown from "../../shared/ui/ColorModeIconDropdown";
import Weather from "./Weather";
import {
    selectIsAuthenticated,
} from "../../features/auth/model/authSlice";

export default function Header() {
    // Показывать бейдж, если есть объявления
    const { announcements } = useAds();
    const hasAds = announcements && announcements.length > 0;
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    return (
        <Stack
            component="section"
            direction="row"
            sx={{
                display: { xs: "none", md: "flex" },
                width: "100%",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                maxWidth: { sm: "100%", md: "1700px" },
                padding: 0,
            }}
            spacing={2}
        >
            <Weather />
            <Stack direction="row" sx={{ gap: 2 }}>
                {isAuthenticated ? (
                    <>
                        <Stack
                            direction="row"
                            sx={{
                                p: 2,
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            <ColorModeIconDropdown />
                            <MenuButton
                                showBadge={hasAds}
                                aria-label="Open notifications"
                            >
                                <NotificationsRoundedIcon />
                            </MenuButton>
                            <UserMenu />
                        </Stack>
                    </>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: { xs: "none", md: "flex" },
                                gap: 1,
                                p: 2,
                                alignItems: "center",
                            }}
                        >
                            <ColorModeIconDropdown />
                            <MenuButton
                                showBadge={hasAds}
                                aria-label="Open notifications"
                            >
                                <NotificationsRoundedIcon />
                            </MenuButton>
                            <Button
                                color="primary"
                                variant="outlined"
                                size="small"
                                component={Link}
                                to="/login"
                                selected={location.pathname === "/login"}
                            >
                                Войти
                            </Button>
                            <Button
                                color="primary"
                                variant="contained"
                                size="small"
                                component={Link}
                                to="/register"
                                selected={location.pathname === "/register"}
                            >
                                Зарегистрироваться
                            </Button>
                        </Box>
                    </>
                )}
            </Stack>
        </Stack>
    );
}
