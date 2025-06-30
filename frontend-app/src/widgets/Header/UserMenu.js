import { useState, Fragment  } from "react";
import { useDispatch } from "react-redux"; 
import { logoutUser } from "../../features/auth/model/authSlice"; 
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Divider, { dividerClasses } from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import { paperClasses } from "@mui/material/Paper";
import { listClasses } from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon, { listItemIconClasses } from "@mui/material/ListItemIcon";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuButton from "../../shared/ui/MenuButton";

const MenuItem = styled(MuiMenuItem)({
    margin: "2px 0",
});

export default function UserMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const dispatch = useDispatch();
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Функция для закрытия меню
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Функция для обработки выхода
    const handleLogout = () => {
        dispatch(logoutUser());
        handleClose();
    };

    return (
        <Fragment>
            <MenuButton
                aria-label="Open menu"
                onClick={handleClick}
                sx={{ borderColor: "transparent" }}
            >
                <Avatar
                    sizes="small"
                    alt="Riley Carter"
                    // src="/static/images/avatar/7.jpg"
                    sx={{ width: 36, height: 36 }}
                    variant="rounded"
                />
            </MenuButton>
            <Menu
                anchorEl={anchorEl}
                id="menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                sx={{
                    [`& .${listClasses.root}`]: {
                        padding: "4px",
                    },
                    [`& .${paperClasses.root}`]: {
                        padding: 0,
                    },
                    [`& .${dividerClasses.root}`]: {
                        margin: "4px -4px",
                    },
                }}
            >
                <MenuItem
                    component={Link}
                    to="/user/profile"
                    onClick={handleClose}
                >
                    Профиль
                </MenuItem>
                {/* <Divider />
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        [`& .${listItemIconClasses.root}`]: {
                            ml: "auto",
                            minWidth: 0,
                        },
                    }}
                >
                    <ListItemText>Выйти</ListItemText>
                    <ListItemIcon>
                        <LogoutRoundedIcon fontSize="small" />
                    </ListItemIcon>
                </MenuItem> */}
            </Menu>
        </Fragment>
    );
}
