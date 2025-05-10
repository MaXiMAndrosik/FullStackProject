import * as React from "react";
import { useAds } from "../../app/providers/AdContext";
import Stack from "@mui/material/Stack";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import UserMenu from "./UserMenu";
import MenuButton from "../../shared/ui/MenuButton";
import ColorModeIconDropdown from "../../shared/ui/ColorModeIconDropdown";
import Weather from "./Weather";

export default function Header() {
    // Показывать бейдж, если есть объявления
    const { announcements } = useAds();
    const hasAds = announcements && announcements.length > 0;

    const isAuth = true;

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
            {/* <NavbarBreadcrumbs /> */}
            <Weather />
            <Stack direction="row" sx={{ gap: 2 }}>
                {isAuth ? (
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
                            <Button color="primary" variant="text" size="small">
                                Войти
                            </Button>
                            <Button
                                color="primary"
                                variant="contained"
                                size="small"
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
