import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import TelegramIcon from "@mui/icons-material/Telegram";
import { Room, Phone, Email } from "@mui/icons-material";

const FooterLink = styled(Link)(({ theme }) => ({
    color: theme.palette.text.secondary,
    "&:hover": {
        color: theme.palette.primary.main,
    },
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
}));

export default function Footer() {
    return (
        <Container
            component="footer"
            maxWidth="lg"
            sx={{
                pt: { xs: 14, sm: 8 },
                pb: { xs: 8, sm: 8 },
            }}
        >
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 4, md: 8 }}
                justifyContent="space-between"
            >
                {/* Блок с контактами */}
                <Box sx={{ maxWidth: 300 }}>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                    >
                        ЖСПК «Зенитчик-4»
                    </Typography>
                    {/* <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                    >
                        Профессиональное управление многоквартирным домом в г.
                        Фаниполь
                    </Typography> */}
                    <FooterLink
                        href="//t.me/zenitchik4"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <TelegramIcon fontSize="small" color="primary" />
                        Наш Telegram-канал
                    </FooterLink>
                </Box>

                {/* Меню навигации */}
                <Stack direction="row" spacing={{ xs: 4, md: 8 }}>
                    <Stack spacing={1}>
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: "bold" }}
                        >
                            Навигация
                        </Typography>
                        <FooterLink href="/" underline="hover">
                            Главная
                        </FooterLink>
                        <FooterLink href="announcements" underline="hover">
                            Объявления
                        </FooterLink>{" "}
                        <FooterLink href="services" underline="hover">
                            Услуги
                        </FooterLink>
                        <FooterLink href="feedback" underline="hover">
                            Обратная связь
                        </FooterLink>
                        <FooterLink href="about" underline="hover">
                            О кооперативе
                        </FooterLink>
                    </Stack>

                    <Stack spacing={1}>
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: "bold" }}
                        >
                            Контакты
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1.5,
                            }}
                        >
                            <Room fontSize="small" color="primary" />
                            <Typography variant="body2" color="text.secondary">
                                {process.env.REACT_APP_ORGANIZATION_ADDRESS}
                            </Typography>
                        </Box>
                        <FooterLink
                            href={`mailto:${process.env.REACT_APP_ORGANIZATION_EMAIL1}`}
                            underline="hover"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <Email fontSize="small" color="primary" />
                            {process.env.REACT_APP_ORGANIZATION_EMAIL1}
                        </FooterLink>
                        <FooterLink
                            href="mailto:zenitchik4@gmail.com"
                            underline="hover"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <Email fontSize="small" color="primary" />
                            {process.env.REACT_APP_ORGANIZATION_EMAIL2}
                        </FooterLink>
                        <FooterLink
                            href={`tel:${process.env.REACT_APP_ORGANIZATION_PHONE1?.replace(
                                /\D/g,
                                ""
                            )}`}
                            underline="hover"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <Phone fontSize="small" color="primary" />
                            {process.env.REACT_APP_ORGANIZATION_PHONE1}
                        </FooterLink>
                    </Stack>
                </Stack>
            </Stack>

            {/* Копирайт */}
            <Box sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: "divider" }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                >
                    © {new Date().getFullYear()} ЖСПК «Зенитчик-4». Все права
                    защищены.
                </Typography>
            </Box>
        </Container>
    );
}
