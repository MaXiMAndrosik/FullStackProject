import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";

import DescriptionIcon from "@mui/icons-material/Description";
import { CTA } from "../../shared/ui/cta";

export default function AboutPage() {
    return (
        <Box
            sx={(theme) => ({
                width: "100%",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
                ...theme.applyStyles("dark", {
                    backgroundImage:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
                }),
            })}
        >
            <Container
                maxWidth="lg"
                sx={{
                    pt: { xs: 14, sm: 8 },
                    pb: { xs: 8, sm: 8 },
                }}
            >
                {/* Заголовок */}
                <Typography
                    variant="h2"
                    sx={{
                        textAlign: "center",
                        mb: 6,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                    }}
                >
                    О нашем
                    <Typography
                        component="span"
                        variant="h2"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                    >
                        кооперативе
                    </Typography>
                </Typography>

                {/* Основной контент */}
                <Stack spacing={6}>
                    {/* Блок с основной информацией */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 4,
                            alignItems: "center",
                        }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={{ fontWeight: "bold" }}
                            >
                                Жилищно-строительный потребительский кооператив
                                «Зенитчик-4»
                            </Typography>
                            <Typography
                                variant="body1"
                                paragraph
                                sx={{
                                    color: "text.secondary",
                                }}
                            >
                                Некоммерческая организация, созданная для
                                строительства и управления многоквартирным жилым
                                домом в г. Фаниполь (Минская область,
                                Дзержинский район).
                            </Typography>
                            <Typography
                                paragraph
                                sx={{
                                    color: "text.secondary",
                                }}
                            >
                                Создана в 2007 году для строительства и
                                управления многоквартирным жилым домом в городе
                                Фаниполь. В 2012 году строительство было успешно
                                завершено, и сейчас мы обеспечиваем комфортное
                                проживание для 80 семей.
                            </Typography>
                            <Typography
                                paragraph
                                sx={{
                                    color: "text.secondary",
                                }}
                            >
                                Наша миссия - профессиональное управление
                                имуществом кооператива, поддержание порядка и
                                благоприятных условий проживания для всех членов
                                ЖСПК.
                            </Typography>
                            {/* Ссылка для скачивания PDF */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mt: 1,
                                    mb: 3,
                                }}
                            >
                                <DescriptionIcon
                                    color="primary"
                                    sx={{ mr: 1 }}
                                />
                                <Link
                                    href="/documents/Statut.pdf"
                                    download="Устав_ЖСПК_Зенитчик-4.pdf"
                                    sx={
                                        {
                                            // display: "flex",
                                            // alignItems: "center",
                                            // textDecoration: "none",
                                            // "&:hover": {
                                            //     textDecoration: "underline",
                                            // },
                                        }
                                    }
                                >
                                    Устав ЖСПК Зенитчик-4
                                </Link>
                            </Box>
                        </Box>
                        <Box
                            component="img"
                            src="/images/AboutImg.png"
                            alt="Фото дома ЖСПК Зенитчик-4"
                            sx={{
                                width: { xs: "100%", md: "50%" },
                                maxWidth: 500,
                                borderRadius: 2,
                                boxShadow: 3,
                            }}
                        />
                    </Box>

                    {/* Реквизиты */}
                    <Box
                        sx={{
                            backgroundColor: "background.paper",
                            borderRadius: 2,
                            p: 4,
                            boxShadow: 1,
                        }}
                    >
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{ fontWeight: "bold" }}
                        >
                            Реквизиты ЖСПК «Зенитчик-4»
                        </Typography>

                        <Stack spacing={1} sx={{ mt: 3 }}>
                            <Box>
                                <Typography variant="subtitle2">
                                    Юридический адрес:
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "text.secondary",
                                    }}
                                >
                                    {process.env.REACT_APP_ORGANIZATION_ADDRESS}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <Typography variant="subtitle2">
                                    Сведения в ЕГР:
                                </Typography>
                                <Link
                                    href="https://egr.gov.by/egrmobile/information?pan=690515860"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        color: "text.secondary",
                                        gap: 1,
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src="https://egr.gov.by/egrmobile/static/img/egr.f86b5faf.png"
                                        alt="ЕГР"
                                        sx={{ height: 20 }}
                                    />
                                    Проверить в Едином реестре
                                </Link>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2">
                                    Банковские реквизиты:
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "text.secondary",
                                    }}
                                >
                                    ЦБУ 606 ОАО "АСБ Беларусбанк"
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "text.secondary",
                                    }}
                                >
                                    г. Дзержинск, ул. К. Маркса, д.17
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "text.secondary",
                                    }}
                                >
                                    БИК: AKBBBY2X
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "text.secondary",
                                    }}
                                >
                                    р/с BY07AKBB30150606006396000000
                                </Typography>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: "text.secondary",
                                    }}
                                >
                                    УНП: 690515860
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
            <Container>
                <CTA />
            </Container>
        </Box>
    );
}
