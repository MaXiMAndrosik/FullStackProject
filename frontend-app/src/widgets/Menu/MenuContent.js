import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/model/authSlice";
import { selectUserRole } from "../../features/auth/model/authSlice";
import { useAds } from "../../app/providers/AdContext";
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
} from "@mui/material";
import { listItemIconClasses } from "@mui/material/ListItemIcon";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import {
    AssignmentRounded as AssignmentRoundedIcon,
    HomeRounded as HomeRoundedIcon,
    HelpRounded as HelpRoundedIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Settings as SettingsIcon,
    Person as PersonIcon,
    Info as InfoIcon,
    ElectricMeter as ElectricMeterIcon,
    FormatListBulleted as FormatListBulletedIcon,
    Receipt as ReceiptIcon,
    Campaign as CampaignIcon,
    PostAdd as PostAddIcon,
    LogoutRounded as LogoutRoundedIcon,
    PersonSearch as PersonSearchIcon,
    AccountCircle as AccountCircleIcon,
    ManageAccounts as ManageAccountsIcon,
    Tune as TuneIcon,
    Badge as BadgeIcon,
} from "@mui/icons-material";

export default function MenuContent() {
    const location = useLocation();
    const userRole = useSelector(selectUserRole);
    const dispatch = useDispatch();

    const { announcements } = useAds();
    const hasAds = announcements && announcements.length > 0;

    const [openServices, setOpenServices] = useState(false);
    const [openOffice, setOpenOffice] = useState(false);

    const handleServicesClick = () => {
        setOpenServices(!openServices);
    };

    const handleOfficeClick = () => {
        setOpenOffice(!openOffice);
    };

    const [openSections, setOpenSections] = useState({
        services: false,
        persons: false,
        office: false,
        // другие разделы
    });

    const toggleSection = (section) => {
        setOpenSections((prev) => {
            const newState = Object.keys(prev).reduce((acc, key) => {
                acc[key] = key === section ? !prev[key] : false;
                return acc;
            }, {});
            return newState;
        });
    };

    // Функция для обработки выхода
    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <Stack component="nav" sx={{ height: "100%" }}>
            <List sx={{ gap: 1 }}>
                {/* Главная */}
                <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                        component={Link}
                        to="/"
                        selected={location.pathname === "/"}
                    >
                        <ListItemIcon>
                            <HomeRoundedIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Главная" />
                    </ListItemButton>
                </ListItem>

                {/* Обьявления */}
                <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                        component={Link}
                        to="/announcements"
                        selected={location.pathname === "/announcements"}
                    >
                        <ListItemIcon>
                            <Badge
                                color="error"
                                variant="dot"
                                invisible={!hasAds}
                            >
                                <CampaignIcon />
                            </Badge>
                        </ListItemIcon>
                        <ListItemText secondary="Объявления" />
                        {/* {hasAds && (
                            <Box
                                sx={{
                                    ml: 1,
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: "error.main",
                                }}
                            />
                        )} */}
                    </ListItemButton>
                </ListItem>

                {/* Личный кабинет */}
                {userRole === "owner" && (
                    <ListItem disablePadding sx={{ display: "block" }}>
                        <ListItemButton onClick={handleOfficeClick}>
                            <ListItemIcon>
                                <PersonIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Личный кабинет" />
                            {openOffice ? (
                                <ExpandLessIcon />
                            ) : (
                                <ExpandMoreIcon />
                            )}
                        </ListItemButton>
                    </ListItem>
                )}
                {/* Вложенные пункты */}
                <Collapse in={openOffice} timeout="auto" unmountOnExit>
                    {/* Квитанции */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/user/receipts"
                            selected={location.pathname === "/user/receipts"}
                        >
                            <ListItemIcon>
                                <ReceiptIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Квитанции" />
                        </ListItemButton>
                    </ListItem>
                    {/* История начислений */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/user/history"
                            selected={location.pathname === "/user/history"}
                        >
                            <ListItemIcon>
                                <FormatListBulletedIcon />
                            </ListItemIcon>
                            <ListItemText secondary="История начислений" />
                        </ListItemButton>
                    </ListItem>
                    {/* Показания счетчиков */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/user/meters"
                            selected={location.pathname === "/user/meters"}
                        >
                            <ListItemIcon>
                                <ElectricMeterIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Показания счетчиков" />
                        </ListItemButton>
                    </ListItem>
                    {/* Настройки профиля */}
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                            paddingTop: 1,
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/user/profile"
                            selected={location.pathname === "/user/profile"}
                        >
                            <ListItemIcon>
                                <ManageAccountsIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Настройки профиля" />
                        </ListItemButton>
                    </ListItem>
                </Collapse>

                {/* Услуги */}
                <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                        component={Link}
                        to="/services"
                        selected={location.pathname === "/services"}
                    >
                        <ListItemIcon>
                            <InfoIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Услуги" />
                    </ListItemButton>
                </ListItem>

                {/* Обращения */}
                <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                        component={Link}
                        to="/appeals"
                        selected={location.pathname === "/appeals"}
                    >
                        <ListItemIcon>
                            <HelpRoundedIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Обращения" />
                    </ListItemButton>
                </ListItem>

                {/* О нас */}
                <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                        component={Link}
                        to="/about"
                        selected={location.pathname === "/about"}
                    >
                        <ListItemIcon>
                            <AssignmentRoundedIcon />
                        </ListItemIcon>
                        <ListItemText secondary="О нас" />
                    </ListItemButton>
                </ListItem>

                {/* Создать обьявление */}
                {userRole === "admin" && (
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                            paddingTop: 1,
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/announcements/new"
                            selected={
                                location.pathname === "/announcements/new"
                            }
                        >
                            <ListItemIcon>
                                <PostAddIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Создать объявление" />
                        </ListItemButton>
                    </ListItem>
                )}

                {/* Настройки услуг и тарифов */}
                {userRole === "admin" && (
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                            paddingTop: 1,
                        }}
                    >
                        <ListItemButton onClick={handleServicesClick}>
                            <ListItemIcon>
                                <TuneIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Настройки услуг и тарифов" />
                            {openServices ? (
                                <ExpandLessIcon />
                            ) : (
                                <ExpandMoreIcon />
                            )}
                        </ListItemButton>
                    </ListItem>
                )}
                {/* Вложенные пункты */}
                <Collapse in={openServices} timeout="auto" unmountOnExit>
                    {/* Настройки ЖКУ */}
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            paddingLeft: 2,
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/admin/services"
                            selected={location.pathname === "/admin/services"}
                        >
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Настройки ЖКУ" />
                        </ListItemButton>
                    </ListItem>
                    {/* Настройки дополнительных услуг */}
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            paddingLeft: 2,
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/admin/services-assignments"
                            selected={
                                location.pathname ===
                                "/admin/services-assignments"
                            }
                        >
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Индивидуальные настройки услуг" />
                        </ListItemButton>
                    </ListItem>
                </Collapse>

                {/* Настройки профиля */}
                {userRole === "user" && (
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                            paddingTop: 1,
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/user/profile"
                            selected={location.pathname === "/user/profile"}
                        >
                            <ListItemIcon>
                                <ManageAccountsIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Настройки профиля" />
                        </ListItemButton>
                    </ListItem>
                )}

                {/* Кнопка выхода внизу */}
                {["admin", "owner", "user"].includes(userRole) && (
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            mt: "auto",
                        }}
                    >
                        <ListItemButton
                            onClick={handleLogout}
                            component={Link}
                            to="/"
                            sx={{
                                justifyContent: "space-between",
                                [`& .${listItemIconClasses.root}`]: {
                                    minWidth: 0,
                                    ml: "auto",
                                },
                            }}
                            selected={location.pathname === "/"}
                        >
                            <ListItemIcon>
                                <LogoutRoundedIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText secondary="Выйти" />
                        </ListItemButton>
                    </ListItem>
                )}

                <ListItemIcon>
                    <ManageAccountsIcon />
                </ListItemIcon>

                <ListItemIcon>
                    <TuneIcon />
                </ListItemIcon>
                <ListItemIcon>
                    <AccountCircleIcon />
                </ListItemIcon>

                <ListItemIcon>
                    <BadgeIcon />
                </ListItemIcon>

                <ListItemIcon>
                    <PersonSearchIcon />
                </ListItemIcon>
            </List>
        </Stack>
    );
}
