import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "./MenuContent";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../features/auth/model/authSlice";

function SideMenuMobile({ open, toggleDrawer }) {
    const location = useLocation();
    const authUser = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={toggleDrawer(false)}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                [`& .${drawerClasses.paper}`]: {
                    backgroundImage: "none",
                    backgroundColor: "background.paper",
                },
            }}
        >
            <Stack
                sx={{
                    maxWidth: "70dvw",
                    height: "100%",
                }}
            >
                <Stack direction="row" sx={{ p: 2, gap: 1 }}>
                    {isAuthenticated ? (
                        <Stack
                            direction="row"
                            sx={{
                                gap: 1,
                                alignItems: "center",
                                flexGrow: 1,
                                p: 1,
                            }}
                        >
                            <Avatar
                                sizes="small"
                                sx={{ bgcolor: "primary.main" }}
                            >
                                {authUser?.name
                                    ?.split(/\s+/)
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((word) => word[0].toUpperCase())
                                    .join("")}
                            </Avatar>
                            <Typography component="p" variant="h6">
                                {authUser?.name}
                            </Typography>
                        </Stack>
                    ) : (
                        <>
                            <Stack
                                direction="column"
                                sx={{
                                    gap: 1,
                                    p: 2,
                                    alignItems: "center",
                                }}
                            >
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
                            </Stack>
                        </>
                    )}
                </Stack>
                <Divider />
                <Stack sx={{ flexGrow: 1 }}>
                    <MenuContent />
                    <Divider />
                </Stack>
            </Stack>
        </Drawer>
    );
}

SideMenuMobile.propTypes = {
    open: PropTypes.bool,
    toggleDrawer: PropTypes.func.isRequired,
};

export default SideMenuMobile;
