import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAds } from "../../app/providers/AdContext";
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import {
    AssignmentRounded as AssignmentRoundedIcon,
    PeopleRounded as PeopleRoundedIcon,
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
} from "@mui/icons-material";

export default function MenuContent() {
    const location = useLocation();

    const { announcements } = useAds();
    const hasAds = announcements && announcements.length > 0;

    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
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
                {/* Создать обьявление */}
                <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                        component={Link}
                        to="/announcements/new"
                        selected={location.pathname === "/announcements/new"}
                    >
                        <ListItemIcon>
                            <PostAddIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Создать объявление" />
                    </ListItemButton>
                </ListItem>
                {/* Личный кабинет */}
                <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton onClick={handleClick}>
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Личный кабинет" />
                        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemButton>
                </ListItem>
                {/* Вложенные пункты */}
                <Collapse in={open} timeout="auto" unmountOnExit>
                    {/* Квитанции */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            disablePadding
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
                            disablePadding
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
                            disablePadding
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
                    {/* Настройки */}
                    <ListItem
                        disablePadding
                        sx={{ display: "block", paddingLeft: 2 }}
                    >
                        <ListItemButton
                            disablePadding
                            component={Link}
                            to="/user/settings"
                            selected={location.pathname === "/user/settings"}
                        >
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText secondary="Настройки" />
                        </ListItemButton>
                    </ListItem>
                </Collapse>

                {/* Домовой чат */}
                <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                        component={Link}
                        to="/chat"
                        selected={location.pathname === "/chat"}
                    >
                        <ListItemIcon>
                            <PeopleRoundedIcon />
                        </ListItemIcon>
                        <ListItemText secondary="Домовой чат" />
                    </ListItemButton>
                </ListItem>

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
                        to="/feedback"
                        selected={location.pathname === "/feedback"}
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
            </List>
        </Stack>
    );
}
