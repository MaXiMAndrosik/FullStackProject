import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Carousel from "react-material-ui-carousel";
import { styled } from "@mui/material/styles";

const CustomCarousel = styled(Carousel)(({ theme }) => ({
    width: "100%",
    height: 400,
    marginTop: theme.spacing(8),
    borderRadius: theme.shape.borderRadius,
    outline: "6px solid",
    outlineColor: "hsla(220, 25%, 80%, 0.2)",
    border: "1px solid",
    borderColor: theme.palette.grey[200],
    boxShadow: "0 0 12px 8px hsla(220, 25%, 80%, 0.2)",
    overflow: "hidden",
    [theme.breakpoints.up("sm")]: {
        marginTop: theme.spacing(10),
        height: 500,
    },
    ...theme.applyStyles("dark", {
        boxShadow: "0 0 24px 12px hsla(210, 100%, 25%, 0.2)",
        outlineColor: "hsla(220, 20%, 42%, 0.1)",
        borderColor: theme.palette.grey[700],
    }),
}));

const carouselItems = [
    {
        img: "/images/Carousel1.jpg",
        alt: "Фасад дома ЖСПК Зенитчик-4",
    },
    {
        img: "/images/Carousel2.jpg",
        alt: "Дворовая территория",
    },
    {
        img: "/images/Carousel3.jpg",
        alt: "Дворовая территория",
    },
    {
        img: "/images/Carousel4.jpg",
        alt: "Собрание членов кооператива",
    },
];

export default function Hero() {
    return (
        <Box
            id="hero"
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
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    pt: { xs: 14, sm: 8 },
                    pb: { xs: 8, sm: 8 },
                }}
            >
                <Stack
                    spacing={2}
                    useFlexGap
                    sx={{
                        alignItems: "center",
                        width: { xs: "100%", sm: "70%" },
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: "center",
                            fontSize: "clamp(3rem, 10vw, 3.5rem)",
                        }}
                    >
                        Ваш&nbsp;уютный&nbsp;
                        <Typography
                            component="span"
                            variant="h1"
                            sx={(theme) => ({
                                fontSize: "inherit",
                                color: "primary.main",
                                ...theme.applyStyles("dark", {
                                    color: "primary.light",
                                }),
                            })}
                        >
                            дом
                        </Typography>
                    </Typography>

                    <Typography
                        sx={{
                            textAlign: "center",
                            color: "text.secondary",
                            width: { sm: "100%", md: "80%" },
                        }}
                    >
                        ЖСПК «Зенитчик-4» - современное управление 80-квартирным
                        домом в Фаниполе. Профессиональное обслуживание и
                        прозрачные решения для комфортной жизни.
                    </Typography>

                    <CustomCarousel
                        animation="fade"
                        duration={800}
                        navButtonsAlwaysVisible
                        indicators
                        sx={{ width: "100%" }}
                    >
                        {carouselItems.map((item, i) => (
                            <Box
                                key={i}
                                component="img"
                                src={item.img}
                                alt={item.alt}
                                sx={{
                                    width: "100%",
                                    height: { xs: 400, sm: 500 },
                                    objectFit: "cover", // или 'contain' в зависимости от потребностей
                                    objectPosition: "center", // выравнивание по центру
                                }}
                            />
                        ))}
                    </CustomCarousel>

                    {/* <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        useFlexGap
                        sx={{ pt: 2, width: { xs: "100%", sm: "350px" } }}
                    >
                        <InputLabel htmlFor="contact-hero" sx={visuallyHidden}>
                            Контакты
                        </InputLabel>
                        <TextField
                            id="contact-hero"
                            hiddenLabel
                            size="small"
                            variant="outlined"
                            aria-label="Оставьте ваш телефон"
                            placeholder="Ваш телефон"
                            fullWidth
                            slotProps={{
                                htmlInput: {
                                    autoComplete: "off",
                                    "aria-label": "Оставьте ваш телефон",
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ minWidth: "fit-content" }}
                        >
                            Оставить заявку
                        </Button>
                    </Stack>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textAlign: "center" }}
                    >
                        Нажимая кнопку, вы соглашаетесь с&nbsp;
                        <Link href="#" color="primary">
                            Уставом кооператива
                        </Link>
                    </Typography> */}
                </Stack>
            </Container>
        </Box>
    );
}
