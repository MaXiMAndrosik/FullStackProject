import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Container,
    Chip,
    Stack,
    CircularProgress,
    Alert,
    Link,
} from "@mui/material";
import {
    CalendarToday,
    LocationOn,
    People,
    Description,
    Phone,
    Email,
} from "@mui/icons-material";
import { useAds } from "../../app/providers/AdContext";
import { CTA } from "../../shared/ui/cta";

export default function AnnouncementsPage() {
    const { announcements, loading, error } = useAds();

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!announcements?.length) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="info">Объявления не найдены</Alert>
            </Container>
        );
    }

    return (
        <Box
            sx={{
                width: "100%",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
                pt: { xs: 4, sm: 8 },
                pb: { xs: 8, sm: 12 },
                px: 2,
            }}
        >
            <Container maxWidth="lg">
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
                    Все
                    <Typography
                        component="span"
                        variant="h2"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                    >
                        объявления
                    </Typography>
                </Typography>

                <Stack spacing={4}>
                    {announcements.map((announcement) => (
                        <Card
                            key={announcement.id}
                            sx={{ boxShadow: 3, borderRadius: 2 }}
                        >
                            <CardContent>
                                <Typography variant="h4" sx={{ mb: 2 }}>
                                    {announcement.title || "Без названия"}
                                </Typography>

                                {/* Блок с датой, локацией и обязательностью */}
                                {(announcement.date ||
                                    announcement.location ||
                                    announcement.necessity) && (
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        sx={{ mb: 3, flexWrap: "wrap" }}
                                    >
                                        {announcement.date && (
                                            <Chip
                                                icon={<CalendarToday />}
                                                label={new Date(
                                                    announcement.date
                                                ).toLocaleString()}
                                                color="primary"
                                            />
                                        )}
                                        {announcement.location && (
                                            <Chip
                                                icon={<LocationOn />}
                                                label={announcement.location}
                                            />
                                        )}
                                        {announcement.necessity && (
                                            <Chip
                                                icon={<People />}
                                                label={announcement.necessity}
                                                color="error"
                                            />
                                        )}
                                    </Stack>
                                )}

                                {/* Основной текст объявления */}
                                {announcement.message?.length > 0 && (
                                    <Box sx={{ mb: 1 }}>
                                        {announcement.message.map(
                                            (paragraph, index) => (
                                                <Typography
                                                    key={index}
                                                    paragraph
                                                    sx={{ fontSize: "1.1rem" }}
                                                >
                                                    {paragraph}
                                                </Typography>
                                            )
                                        )}
                                    </Box>
                                )}

                                {/* Повестка дня (только если есть хотя бы один непустой пункт) */}
                                {announcement.agenda?.filter((item) =>
                                    item?.trim()
                                ).length > 0 && (
                                    <>
                                        <Typography
                                            variant="h5"
                                            sx={{ fontWeight: "bold", mb: 2 }}
                                        >
                                            Повестка дня:
                                        </Typography>
                                        <Box
                                            component="ol"
                                            sx={{
                                                pl: 3,
                                                mb: 3,
                                                "& li": {
                                                    mb: 1,
                                                    pl: 1,
                                                },
                                            }}
                                        >
                                            {announcement.agenda
                                                .filter((item) => item?.trim()) // Фильтруем пустые и состоящие только из пробелов строки
                                                .map((item, index) => (
                                                    <Box
                                                        component="li"
                                                        key={index}
                                                    >
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight:
                                                                    "medium",
                                                            }}
                                                        >
                                                            {item ||
                                                                `Пункт повестки ${
                                                                    index + 1
                                                                }`}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                        </Box>
                                    </>
                                )}

                                {/* Документы (только если есть хотя бы один документ) */}
                                {announcement.documents?.filter(
                                    (doc) => doc.name
                                ).length > 0 && (
                                    <>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: "bold", mb: 1 }}
                                        >
                                            Документы:
                                        </Typography>
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            sx={{ mb: 3 }}
                                        >
                                            {announcement.documents
                                                .filter(
                                                    (doc) => doc.name || doc.url
                                                )
                                                .map((doc, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="outlined"
                                                        startIcon={
                                                            <Description />
                                                        }
                                                        href={doc.url}
                                                        target="_blank"
                                                        disabled={!doc.url}
                                                    >
                                                        {doc.name || "Документ"}
                                                    </Button>
                                                ))}
                                        </Stack>
                                    </>
                                )}

                                {/* Подпись (только если есть) */}
                                {announcement.signature && (
                                    <Typography variant="h6" sx={{ mt: 1 }}>
                                        {announcement.signature}
                                    </Typography>
                                )}

                                {/* Контакты (только если есть телефон или email) */}
                                {(announcement.contacts?.phone ||
                                    announcement.contacts?.email) && (
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                        sx={{
                                            fontStyle: "italic",
                                            mt: 1,
                                            color: "text.secondary",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <Typography variant="body2">
                                            Контакты:
                                        </Typography>

                                        {announcement.contacts?.phone && (
                                            <Link
                                                href={`tel:${announcement.contacts.phone}`}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    color: "primary.main",
                                                }}
                                            >
                                                <Phone fontSize="small" />
                                                <span>
                                                    {
                                                        announcement.contacts
                                                            .phone
                                                    }
                                                </span>
                                            </Link>
                                        )}

                                        {announcement.contacts?.email && (
                                            <Link
                                                href={`mailto:${announcement.contacts.email}`}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    color: "primary.main",
                                                }}
                                            >
                                                <Email fontSize="small" />
                                                <span>
                                                    {
                                                        announcement.contacts
                                                            .email
                                                    }
                                                </span>
                                            </Link>
                                        )}
                                    </Stack>
                                )}

                                {/* Дата публикации */}
                                {announcement.publish && (
                                    <Box sx={{ pt: 2 }}>
                                        <Chip
                                            icon={<CalendarToday />}
                                            label={`Дата публикации: ${new Date(
                                                announcement.publish
                                            ).toLocaleDateString("ru-RU")}`}
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Stack>

                <CTA />
            </Container>
        </Box>
    );
}
