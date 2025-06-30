import { useState } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Button,
    Stack,
    Container,
    Grid,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";

import ElectricityIcon from "@mui/icons-material/ElectricBolt";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import WaterIcon from "@mui/icons-material/Plumbing";
// import HeatingIcon from "@mui/icons-material/LocalFireDepartment";
import GasIcon from "@mui/icons-material/GasMeter";
import PhonelinkIcon from "@mui/icons-material/Phonelink";
import DescriptionIcon from "@mui/icons-material/Description";
import HotTubIcon from "@mui/icons-material/HotTub";
import WasteIcon from "@mui/icons-material/Recycling";
import TelegramIcon from "@mui/icons-material/Telegram";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
// import ElevatorIcon from "@mui/icons-material/Elevator";
import ConstructionIcon from "@mui/icons-material/Construction";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import PlumbingIcon from "@mui/icons-material/Plumbing";
// import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import { CTA } from "../../shared/ui/cta";

const services = [
    {
        icon: <ConstructionIcon fontSize="small" />,
        title: "Капитальный ремонт",
        shortDescription: "Восстановление изношенных конструкций",
        fullDescription:
            "Основная жилищно-коммунальная услуга по восстановлению основных физико-технических, эстетических и потребительских качеств жилого дома, иного капитального строения (здания, сооружения), их конструктивных элементов, инженерных систем, утраченных в процессе эксплуатации",
        provider: "УП «Дзержинское ЖКХ»",
        contacts: {
            telegram: "https://t.me/dzerzhkh",
            website: "https://www.dzerzhinsk.gov.by/up-dzerzhinskoe-zhkkh",
        },
    },
    {
        icon: <PlumbingIcon fontSize="small" />,
        title: "Текущий ремонт",
        shortDescription: "Устранение мелких повреждений",
        fullDescription:
            "Основная жилищно-коммунальная услуга по предотвращению интенсивного износа, восстановлению исправности и устранению повреждений конструктивных элементов, инженерных систем жилого дома",
        provider: "ЖСПК «Зенитчик-4»",
        contacts: {
            telegram: "//t.me/zenitchik4",
            website: "/",
        },
    },

    {
        icon: <HomeRepairServiceIcon fontSize="small" />,
        title: "Техническое обслуживание",
        shortDescription: "Поддержание работоспособности инженерных систем",
        fullDescription:
            "Основная жилищно-коммунальная услуга, включающая работы по поддержанию в исправном и работоспособном состоянии конструктивных элементов, инженерных систем, за исключением лифтов, обеспечению установленных параметров и режимов работы инженерных систем, за исключением лифтов, подготовке жилых домов к условиям весенне-летнего и осенне-зимнего периодов года",
        provider: "УП «Дзержинское ЖКХ»",
        contacts: {
            telegram: "https://t.me/dzerzhkh",
            website: "https://www.dzerzhinsk.gov.by/up-dzerzhinskoe-zhkkh",
        },
    },
    {
        icon: <CleaningServicesIcon fontSize="small" />,
        title: "Санитарное содержание вспомогательных помещений жилого дома",
        shortDescription: "Уборка общественных зон",
        fullDescription:
            "Основная жилищно-коммунальная услуга по санитарной обработке (уборке) вспомогательных помещений жилого дома, их конструктивных элементов, инженерных систем, в том числе мойка или иная обработка поверхностей вспомогательных помещений, включая дезинфекцию, дезинсекцию, дератизацию, для приведения этих помещений в соответствие с установленными санитарными нормами и правилами, гигиеническими нормативами",
        provider: "ЖСПК «Зенитчик-4»",
        contacts: {
            telegram: "//t.me/zenitchik4",
            website: "/",
        },
    },
    // {
    //     icon: <ElevatorIcon fontSize="small" />,
    //     title: "Техническое обслуживание лифтов",
    //     shortDescription: "Для домов с лифтовым оборудованием",
    //     fullDescription:
    //         "Основная жилищно-коммунальная услуга, включающая работы по поддержанию работоспособности лифта при его эксплуатации",
    //     provider: "не предоставляется",
    //     contacts: {
    //         // telegram: "https://t.me/dzerzhkh",
    //         // website: "https://www.dzerzhinsk.gov.by/up-dzerzhinskoe-zhkkh",
    //     },
    // },
];

const publicUtilities = {
    water: [
        {
            title: "Холодное водоснабжение и водоотведение (канализация)",
            description:
                "Бесперебойная подача холодной воды. Отведение сточных вод из жилых помещений",
            provider: "КУП«ВОДОКАНАЛ ДЗЕРЖИНСКОГО РАЙОНА»",
            contacts: {
                website:
                    "https://www.dzerzhinsk.gov.by/kup-vodokanal-dzerzhinskogo-rajona",
            },
        },
    ],
    hotwater: [
        {
            title: "Горячее водоснабжение",
            description:
                "Обеспечение подачи горячей воды в жилые помещения круглосуточно в соответствии с установленными нормами качества и температуры",
            provider: "УП «Дзержинское ЖКХ»",
            contacts: {
                telegram: "https://t.me/dzerzhkh",
                website: "https://www.dzerzhinsk.gov.by/up-dzerzhinskoe-zhkkh",
            },
        },
    ],
    heating: [
        {
            title: "Теплоснабжение",
            description:
                "Обеспечение теплоснабжения жилых помещений в отопительный сезон",
            provider: "УП «Дзержинское ЖКХ»",
            contacts: {
                telegram: "https://t.me/dzerzhkh",
                website: "https://www.dzerzhinsk.gov.by/up-dzerzhinskoe-zhkkh",
            },
        },
    ],
    energy: [
        {
            title: "Электроснабжение",
            description:
                "Обеспечение бесперебойной подачи электроэнергии в соответствии с установленными нормами и стандартами",
            provider:
                "Дзержинский РЭС филиала «Столбцовские электросети» РУП «Минскэнерго»",
            contacts: {
                telegram: "",
                website:
                    "https://web.minskenergo.by/filialy/filial-stolbtsovskie-elektricheskie-seti/kontakty-filiala-stolbtsovskie-elektricheskie-seti/",
            },
        },
    ],
    gas: [
        {
            title: "Газоснабжение",
            description:
                "Подача природного газа для бытовых нужд в соответствии с установленными нормами безопасности",
            provider:
                "Дзержинское производственное управление газового хозяйства «Дзержинскгаз»",
            contacts: {
                website:
                    "https://www.dzerzhinsk.gov.by/slutskoe-proizvodstvennoe-upravlenie-pu-slutskgaz",
            },
        },
    ],
    waste: [
        {
            title: "Обращение с ТКО",
            description:
                "Вывоз и утилизация твердых коммунальных отходов в соответствии с экологическими нормами",
            provider: "УП «Дзержинское ЖКХ»",
            contacts: {
                telegram: "https://t.me/dzerzhkh",
                website: "https://www.dzerzhinsk.gov.by/up-dzerzhinskoe-zhkkh",
            },
        },
    ],
};

const additionalServices = [
    {
        title: "Техническое обслуживание домофонных систем",
        icon: <PhonelinkIcon fontSize="large" />,
        description:
            "Комплекс работ по обеспечению бесперебойной работы домофонного оборудования, включая диагностику, ремонт и замену компонентов системы контроля доступа.",
        provider: "ООО «Домофонинвест»",
        contacts: {
            website: "https://domofon24.by/contacts/",
        },
    },
];

export default function HousingServicesPage() {
    const [tabValue, setTabValue] = useState("water");

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box
            component="section"
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
                // maxWidth="lg"
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
                        mb: 4,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                    }}
                >
                    Жилищно-коммунальные
                    <Typography
                        component="span"
                        variant="h2"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                    >
                        услуги
                    </Typography>
                </Typography>

                {/* Основные услуги */}
                <Box component="section" sx={{ mb: 6 }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}
                    >
                        Основные жилищно-коммунальные услуги
                    </Typography>

                    <Grid container spacing={4}>
                        {services.map((service, index) => (
                            <Grid
                                key={index}
                                size={{ xs: 12, md: 6 }}
                                sx={{ display: "flex" }}
                            >
                                <Card
                                    sx={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        boxShadow: 3,
                                        borderRadius: 2,
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mb: 2,
                                                gap: 2,
                                            }}
                                        >
                                            {service.icon}
                                            <Typography
                                                variant="h5"
                                                component="div"
                                                sx={{ fontWeight: "bold" }}
                                            >
                                                {service.title}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            paragraph
                                            sx={{
                                                flex: 1,
                                                color: "text.secondary",
                                            }}
                                        >
                                            {service.fullDescription}
                                        </Typography>
                                        <Box sx={{ mt: "auto" }}>
                                            <Typography
                                                variant="body2"
                                                sx={{ mb: 1 }}
                                            >
                                                <strong>
                                                    Организация оказывающая
                                                    услугу:
                                                </strong>{" "}
                                                {service.provider}
                                            </Typography>
                                            <Stack direction="row" spacing={2}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<TelegramIcon />}
                                                    href={
                                                        service.contacts
                                                            .telegram
                                                    }
                                                    target="_blank"
                                                >
                                                    Telegram
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    href={
                                                        service.contacts.website
                                                    }
                                                    target="_blank"
                                                >
                                                    Сайт
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Коммунальные услуги */}
                <Box component="section" sx={{ mt: 6, mb: 6 }}>
                    {/*Заголовок*/}
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontWeight: "bold",
                            mb: 2,
                            textAlign: "center",
                        }}
                    >
                        Коммунальные услуги
                    </Typography>

                    {/* Вкладки Tab*/}
                    <Box
                        sx={{
                            borderBottom: 1,
                            borderColor: "divider",
                            mb: 4,
                        }}
                    >
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                        >
                            <Tab
                                label="Водоснабжение"
                                value="water"
                                icon={<WaterIcon />}
                                iconPosition="start"
                            />
                            <Tab
                                label="Горячее водоснабжение"
                                value="hotwater"
                                icon={<HotTubIcon />}
                                iconPosition="start"
                            />
                            <Tab
                                label="Теплоснабжение"
                                value="heating"
                                icon={<LocalFireDepartmentIcon />}
                                iconPosition="start"
                            />
                            <Tab
                                label="Электроснабжение"
                                value="energy"
                                icon={<ElectricityIcon />}
                                iconPosition="start"
                            />
                            <Tab
                                label="Газоснабжение"
                                value="gas"
                                icon={<GasIcon />}
                                iconPosition="start"
                            />
                            <Tab
                                label="Обращение с ТКО"
                                value="waste"
                                icon={<WasteIcon />}
                                iconPosition="start"
                            />
                        </Tabs>
                    </Box>

                    {/* Содержимое вкладок Tabs*/}
                    <Grid
                        container
                        spacing={4}
                        sx={{ width: "100%", margin: 0 }}
                    >
                        {publicUtilities[tabValue].map((service, index) => (
                            <Grid
                                size={{ xs: 12 }}
                                key={index}
                                sx={{ width: "100%" }}
                            >
                                <Card
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        boxShadow: 3,
                                        borderRadius: 2,
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            p: 3,
                                        }}
                                    >
                                        {/* Название услуги*/}
                                        <Typography
                                            variant="h5"
                                            component="div"
                                            sx={{
                                                fontWeight: "bold",
                                                mb: 2,
                                            }}
                                        >
                                            {service.title}
                                        </Typography>
                                        {/* Описание услуги*/}
                                        <Typography
                                            paragraph
                                            sx={{
                                                flex: 1,
                                                color: "text.secondary",
                                            }}
                                        >
                                            {service.description}
                                        </Typography>

                                        {/* Организация оказывающая услугу и кнопки*/}
                                        <Box sx={{ mt: "auto" }}>
                                            {/* Организация оказывающая услугу */}
                                            <Typography
                                                variant="body2"
                                                sx={{ mb: 1 }}
                                            >
                                                <strong>
                                                    Организация оказывающая
                                                    услугу:
                                                </strong>{" "}
                                                {service.provider}
                                            </Typography>

                                            {/* Кнопки Сайт и Телеграм*/}
                                            <Stack direction="row" spacing={2}>
                                                {service.contacts.telegram && (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={
                                                            <TelegramIcon />
                                                        }
                                                        href={
                                                            service.contacts
                                                                .telegram
                                                        }
                                                        target="_blank"
                                                    >
                                                        Telegram
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    href={
                                                        service.contacts.website
                                                    }
                                                    target="_blank"
                                                >
                                                    Сайт
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Дополнительные услуги */}
                <Box component="section" sx={{ mb: 6 }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}
                    >
                        Дополнительные услуги
                    </Typography>
                    <Typography sx={{ textAlign: "center", mb: 4 }}>
                        Видеонаблюдение, консьерж-служба и другие услуги по
                        желанию жильцов
                    </Typography>
                    <Grid container spacing={4}>
                        {additionalServices.map((service, index) => (
                            <Grid
                                size={{ xs: 12 }}
                                key={index}
                                sx={{ width: "100%" }}
                            >
                                <Card
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        boxShadow: 3,
                                        borderRadius: 2,
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mb: 2,
                                                gap: 2,
                                            }}
                                        >
                                            {service.icon}
                                            <Typography
                                                variant="h5"
                                                component="div"
                                                sx={{ fontWeight: "bold" }}
                                            >
                                                {service.title}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            paragraph
                                            sx={{
                                                flex: 1,
                                                color: "text.secondary",
                                            }}
                                        >
                                            {service.description}
                                        </Typography>
                                        <Box sx={{ mt: "auto" }}>
                                            <Typography
                                                variant="body2"
                                                sx={{ mb: 1 }}
                                            >
                                                <strong>
                                                    Организация оказывающая
                                                    услугу:
                                                </strong>{" "}
                                                {service.provider}
                                            </Typography>
                                            <Stack direction="row" spacing={2}>
                                                {service.contacts.telegram && (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={
                                                            <TelegramIcon />
                                                        }
                                                        href={
                                                            service.contacts
                                                                .telegram
                                                        }
                                                        target="_blank"
                                                    >
                                                        Telegram
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    href={
                                                        service.contacts.website
                                                    }
                                                    target="_blank"
                                                >
                                                    Сайт
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Порядок оказания услуг */}
                <Box
                    component="section"
                    sx={{
                        backgroundColor: "background.paper",
                        p: 4,
                        boxShadow: 3,
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                    >
                        Порядок оказания услуг
                    </Typography>
                    <List dense sx={{ pt: 0 }}>
                        <ListItem>
                            <ListItemText
                                primary="Сроки оплаты"
                                secondary="Основные ЖКУ оплачиваются до 25 числа следующего месяца"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Начисление"
                                secondary="Производится на основании извещений, которые направляются не позднее 15 числа"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Особенности оплаты"
                                secondary="Техническое обслуживание, лифты, санитарное содержание оплачиваются пропорционально площади помещения"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Капитальный ремонт"
                                secondary="Средства аккумулируются на спецсчетах и используются строго по назначению"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Коммунальные услуги"
                                secondary="Оплачиваются по показаниям приборов учета или нормативам"
                            />
                        </ListItem>
                    </List>
                </Box>

                {/* Жилищный кодекс Республики Беларусь */}
                <Box
                    sx={{
                        textAlign: "center",
                        mt: 4,
                        mb: 4,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        variant="outlined"
                        color="primary"
                        href="https://pravo.by/document/?guid=3871&p0=hk1200428"
                        target="_blank"
                        rel="noopener noreferrer"
                        size="large"
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 50,
                            textTransform: "none",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            "&:hover": {
                                backgroundColor: "primary.main",
                                color: "primary.contrastText",
                                boxShadow: 2,
                            },
                        }}
                        startIcon={
                            <DescriptionIcon
                                fontSize="large"
                                sx={{ color: "primary.main" }}
                            />
                        }
                    >
                        Жилищный кодекс Республики Беларусь
                    </Button>
                </Box>
            </Container>
            <Container>
                <CTA />
            </Container>
        </Box>
    );
}
