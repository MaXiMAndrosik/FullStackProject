import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAds } from "../../app/providers/AdContext";
import {
    Box,
    Container,
    Typography,
    Stack,
    Card,
    CardContent,
    IconButton,
    Grid,
    Tabs,
    Tab,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import SimpleAnnouncement from "./components/SimpleAnnouncement";
import MeetingAnnouncement from "./components/MeetingAnnouncement";

export default function AnnouncementForm() {
    const { announcements, addAnnouncement, deleteAnnouncement } = useAds();
    const [tabValue, setTabValue] = useState(0);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        message: [""],
        contacts: {
            phone: "",
            email: "",
        },
        signature: "",
        publish: new Date().toISOString(),
        date: "",
        location: "",
        necessity: "",
        agenda: [""],
        documents: [],
        expiresAt: "",
    });

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Универсальный обработчик изменений
    const handleChange = (field, value) => {
        setForm((prev) => {
            // Обработка массивов (для message и agenda)
            if (Array.isArray(prev[field])) {
                return {
                    ...prev,
                    [field]: value,
                };
            }

            // Обработка вложенных полей (contacts.phone, contacts.email)
            if (field.includes(".")) {
                const [parent, child] = field.split(".");
                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value || null,
                    },
                };
            }

            // Обработка обычных полей
            return {
                ...prev,
                [field]: value || null,
            };
        });
    };

    // Расширенный обработчик для работы с массивами
    const handleArrayChange = (field, index, value) => {
        setForm((prev) => {
            const newArray = [...prev[field]];
            newArray[index] = value;
            return {
                ...prev,
                [field]: newArray,
            };
        });
    };

    // Обработчик для добавления элементов в массив
    const handleAddToArray = (field, defaultValue = "") => {
        setForm((prev) => ({
            ...prev,
            [field]: [...prev[field], defaultValue],
        }));
    };

    // Обработчик для удаления элементов из массива
    const handleRemoveFromArray = (field, index) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    // Универсальный обработчик отправки
    const handleSubmit = (formData) => {
        // Очистка пустых полей перед отправкой
        const cleanedData = Object.fromEntries(
            Object.entries(formData).filter(([_, v]) => v !== "" && v !== null)
        );
        console.log(cleanedData);
        addAnnouncement(cleanedData);
        navigate("/announcements");
    };

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
                    pt: { xs: 4, sm: 8 },
                    pb: { xs: 8, sm: 8 },
                }),
            })}
        >
            <Container maxWidth="lg">
                {/* Список существующих объявлений */}
                {announcements?.length > 0 && (
                    <Box sx={{ mb: 4 }}>
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
                            Предыдущие
                            <Typography
                                component="span"
                                variant="h2"
                                color="primary"
                                sx={{ fontWeight: "bold" }}
                            >
                                объявления
                            </Typography>
                        </Typography>

                        <Stack spacing={2}>
                            {announcements.map((announcement) => (
                                <Card key={announcement.id}>
                                    <CardContent>
                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                        >
                                            <Typography variant="subtitle1">
                                                {announcement?.title ||
                                                    "Без названия"}
                                            </Typography>
                                            <IconButton
                                                onClick={() =>
                                                    deleteAnnouncement(
                                                        announcement?.id
                                                    )
                                                }
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="body2">
                                            {new Date(
                                                announcement?.publish
                                            ).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" noWrap>
                                            {announcement?.message ||
                                                "Нет описания"}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Форма создания */}
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
                    Создать новое
                    <Typography
                        component="span"
                        variant="h2"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                    >
                        объявление
                    </Typography>
                </Typography>

                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{ mb: 4 }}
                    variant="fullWidth"
                >
                    <Tab label="Обычное объявление" />
                    <Tab label="Объявление о собрании" />
                </Tabs>

                <Grid container spacing={3}>
                    {/* Выбор формы объявления */}
                    <Grid size={{ xs: 12, md: tabValue === 0 ? 12 : 12 }}>
                        {tabValue === 0 ? (
                            <SimpleAnnouncement
                                form={form}
                                onChange={handleChange}
                                onArrayChange={handleArrayChange}
                                onAddToArray={handleAddToArray}
                                onRemoveFromArray={handleRemoveFromArray}
                                onSubmit={handleSubmit}
                            />
                        ) : (
                            <MeetingAnnouncement
                                form={form}
                                onChange={handleChange}
                                onArrayChange={handleArrayChange}
                                onAddToArray={handleAddToArray}
                                onRemoveFromArray={handleRemoveFromArray}
                                onSubmit={handleSubmit}
                            />
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
