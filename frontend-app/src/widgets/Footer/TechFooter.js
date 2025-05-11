import * as React from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TelegramIcon from "@mui/icons-material/Telegram";

// Стилизованная ссылка
const MetaLink = styled(Link)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
    "&:hover": { color: theme.palette.primary.main },
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
}));

export function TechFooter() {
    return (
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            {/* React - официальная иконка с react.dev */}
            <MetaLink href="https://react.dev" target="_blank" rel="noopener">
                <Box
                    component="img"
                    src="https://react.dev/favicon.ico"
                    width={16}
                    height={16}
                    alt="React"
                    sx={{ display: "inline-block" }}
                />
                Powered by React
            </MetaLink>

            {/* Laravel - официальная иконка с laravel.com */}
            <MetaLink href="https://laravel.com" target="_blank" rel="noopener">
                <Box
                    component="img"
                    src="https://laravel.com/img/favicon/favicon.ico"
                    width={16}
                    height={16}
                    alt="Laravel"
                    sx={{ display: "inline-block" }}
                />
                Powered by Laravel
            </MetaLink>

            {/* MySQL - иконка из официального бренд-бука */}
            <MetaLink href="https://mysql.com" target="_blank" rel="noopener">
                <Box
                    component="img"
                    src="https://labs.mysql.com/common/logos/mysql-logo.svg"
                    width={16}
                    height={16}
                    alt="MySQL"
                    sx={{ display: "inline-block" }}
                />
                Database: MySQL
            </MetaLink>

            {/* Material UI - иконка с mui.com */}
            <MetaLink href="https://mui.com" target="_blank" rel="noopener">
                <Box
                    component="img"
                    src="https://mui.com/static/favicon.ico"
                    width={16}
                    height={16}
                    alt="MUI"
                    sx={{ display: "inline-block" }}
                />
                UI: Material UI
            </MetaLink>

            {/* Разработчик */}
            <MetaLink
                // href="https://t.me/?id=1834297995"
                href={`${"https:"}//${"t.me"}?${"id"}=1834297995`} // (web-версия)
                // href={`${"tg:"}//${"user"}?${"id"}=1834297995`} // (открывает в приложении)
                target="_blank"
                rel="noopener noreferrer nofollow"
            >
                <TelegramIcon fontSize="small" color="primary" />
                Developed by Maxim Androsik
            </MetaLink>
        </Stack>
    );
}
