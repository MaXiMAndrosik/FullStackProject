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
    AttachMoney as AttachMoneyIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Home as HomeIcon,
    VerifiedUser as VerifiedUserIcon,
    Apartment as ApartmentIcon,
    DomainAdd as DomainAddIcon,
    ContactMail as ContactMailIcon,
    ListAlt as ListAltIcon,
    SettingsInputHdmi as MetersIcon,
    Payment as PaymentIcon,
    TableChart as TableChartIcon,
    AccountBalanceWallet as AccountBalanceWalletIcon,
    Assessment as AssessmentIcon,
} from "@mui/icons-material";

export default function MenuContent() {
    const location = useLocation();
    const userRole = useSelector(selectUserRole);
    const dispatch = useDispatch();

    const { announcements } = useAds();
    const hasAds = announcements && announcements.length > 0;

    const [openUsersServices, setOpenUsersServices] = useState(false);
    const [openServices, setOpenServices] = useState(false);
    const [openOffice, setOpenOffice] = useState(false);
    const [openObjects, setOpenObjects] = useState(false);

    const handleUsersServicesClick = () => {
        setOpenUsersServices(!openUsersServices);
    };

    const handleServicesClick = () => {
        setOpenServices(!openServices);
    };

    const handleOfficeClick = () => {
        setOpenOffice(!openOffice);
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
                    {/* Тарифы и услуги */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/owner/services"
                            selected={location.pathname === "/owner/services"}
                        >
                            <ListItemIcon>
                                <AttachMoneyIcon />{" "}
                            </ListItemIcon>
                            <ListItemText secondary="Тарифы и услуги" />
                        </ListItemButton>
                    </ListItem>
                    {/* Показания счетчиков */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/owner/meters"
                            selected={location.pathname === "/owner/meters"}
                        >
                            <ListItemIcon>
                                <ElectricMeterIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Показания счетчиков" />
                        </ListItemButton>
                    </ListItem>
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
                    {/* Профиль */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/user/profile"
                            selected={location.pathname === "/user/profile"}
                        >
                            <ListItemIcon>
                                <AccountCircleIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Профиль" />
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
                {/* Новое объявление */}
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
                            <ListItemText secondary="Новое объявление" />
                        </ListItemButton>
                    </ListItem>
                )}
                {/* Просмотр обращений */}
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
                            to="admin/appeals"
                            selected={location.pathname === "admin/appeals"}
                        >
                            <ListItemIcon>
                                <ContactMailIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Обращения пользователей" />
                        </ListItemButton>
                    </ListItem>
                )}
                {/* Настройки пользователей */}
                {userRole === "admin" && (
                    <ListItem
                        disablePadding
                        sx={{
                            display: "block",
                            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                            paddingTop: 1,
                        }}
                    >
                        <ListItemButton onClick={handleUsersServicesClick}>
                            <ListItemIcon>
                                <ManageAccountsIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Пользователи" />
                            {openUsersServices ? (
                                <ExpandLessIcon />
                            ) : (
                                <ExpandMoreIcon />
                            )}
                        </ListItemButton>
                    </ListItem>
                )}
                {/* Вложенные пункты */}
                <Collapse in={openUsersServices} timeout="auto" unmountOnExit>
                    {/* Главная панель */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/admin"
                            selected={location.pathname === "/admin"}
                        >
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Главная панель" />
                        </ListItemButton>
                    </ListItem>

                    {/* Пользователи */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/admin/users"
                            selected={location.pathname === "/admin/users"}
                        >
                            <ListItemIcon>
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Все пользователи" />
                        </ListItemButton>
                    </ListItem>

                    {/* Собственники */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/admin/owners"
                            selected={location.pathname === "/admin/owners"}
                        >
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Собственники" />
                        </ListItemButton>
                    </ListItem>

                    {/* Верификация */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/admin/verification"
                            selected={
                                location.pathname === "/admin/verification"
                            }
                        >
                            <ListItemIcon>
                                <VerifiedUserIcon />
                            </ListItemIcon>
                            <ListItemText primary="Верификация" />
                        </ListItemButton>
                    </ListItem>
                </Collapse>
                {/* Управление объектами */}
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
                            onClick={() => setOpenObjects(!openObjects)}
                        >
                            <ListItemIcon>
                                <ApartmentIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Объекты ЖСПК" />
                            {openObjects ? (
                                <ExpandLessIcon />
                            ) : (
                                <ExpandMoreIcon />
                            )}
                        </ListItemButton>
                    </ListItem>
                )}
                <Collapse in={openObjects} timeout="auto" unmountOnExit>
                    <ListItem disablePadding sx={{ pl: 3 }}>
                        <ListItemButton
                            component={Link}
                            to="/admin/apartments"
                            selected={location.pathname === "/admin/apartments"}
                        >
                            <ListItemIcon>
                                <ApartmentIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Квартиры" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ pl: 3 }}>
                        <ListItemButton
                            component={Link}
                            to="/admin/meters"
                            selected={location.pathname === "/admin/meters"}
                        >
                            <ListItemIcon>
                                <MetersIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Приборы учета" />
                        </ListItemButton>
                    </ListItem>
                </Collapse>
                {/* Бухгалтерия */}
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
                                <AttachMoneyIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Бухгалтерия" />
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
                                <ApartmentIcon />
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
                                <TuneIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Индивидуальные настройки услуг" />
                        </ListItemButton>
                    </ListItem>
                    {/* Показания счетчиков */}
                    <ListItem disablePadding sx={{ pl: 2 }}>
                        <ListItemButton
                            component={Link}
                            to="/admin/meter-readings"
                            selected={
                                location.pathname === "/admin/meter-readings"
                            }
                        >
                            <ListItemIcon>
                                <ListAltIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Показания счетчиков" />
                        </ListItemButton>
                    </ListItem>
                    {/* Таблица платежей */}
                    <ListItem disablePadding sx={{ pl: 2 }}>
                        <ListItemButton
                            component={Link}
                            to="/admin/payment-table"
                            selected={
                                location.pathname === "/admin/payment-table"
                            }
                        >
                            <ListItemIcon>
                                <TableChartIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Таблица платежей" />
                        </ListItemButton>
                    </ListItem>
                    {/* Начисления */}
                    <ListItem disablePadding sx={{ pl: 2 }}>
                        <ListItemButton
                            component={Link}
                            to="/admin/payment-table"
                            selected={
                                location.pathname === "/admin/payment-table"
                            }
                        >
                            <ListItemIcon>
                                <AccountBalanceWalletIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Начисления" />
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
                {/* <ListItemIcon>
                    <BadgeIcon />
                </ListItemIcon>
                <ListItemIcon>
                    <TuneIcon />
                </ListItemIcon>
                <ListItemIcon>
                    <PersonSearchIcon />
                </ListItemIcon>
                <ListItemIcon>
                    <InfoIcon />
                </ListItemIcon> */}
                {/* // Вариант 1 - Платежи/транзакции */}
                {/* <ListItemIcon><PaymentIcon /></ListItemIcon> */}
                {/* // Вариант 2 - Таблица/список */}
                {/* <ListItemIcon>
                    <TableChartIcon />
                </ListItemIcon> */}
                {/* // Вариант 3 - Деньги + таблица */}
                {/* <ListItemIcon>
                    <AccountBalanceWalletIcon />
                </ListItemIcon> */}
                {/* // Вариант 4 - Список операций */}
                {/* <ListItemIcon>
                    <ReceiptIcon />
                </ListItemIcon> */}
                {/* // Вариант 5 - Финансовая отчетность */}
                {/* <ListItemIcon>
                    <AssessmentIcon />
                </ListItemIcon> */}
            </List>
        </Stack>
    );
}
