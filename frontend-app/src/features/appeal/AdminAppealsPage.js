import React, { useState, useEffect } from "react";
import {
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Box,
    Container,
    Typography,
    Stack,
    Chip,
    Link,
    Card,
    CardContent,
    TextField,
} from "@mui/material";
import { CalendarToday, Email } from "@mui/icons-material";
import apiClient from "../../app/api/client";
import {
    showSuccess,
    showError,
} from "../../shared/services/notificationService";
import StyledTextArea from "../../shared/ui/StyledTextArea";

const AdminAppealsPage = () => {
    const [appeals, setAppeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [responseText, setResponseText] = useState("");

    useEffect(() => {
        fetchAppeals();
    }, [statusFilter]);

    const fetchAppeals = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/admin/appeals${
                    statusFilter !== "all" ? `?status=${statusFilter}` : ""
                }`
            );
            setAppeals(response.data.data);
        } catch (error) {
            showError("Ошибка загрузки обращений");
        } finally {
            setLoading(false);
        }
    };

    const statusLabels = {
        new: { label: "Новое", color: "error" },
        resolved: { label: "Обработано", color: "success" },
    };

    const handleOpenDialog = (appeal) => {
        setSelectedAppeal(appeal);
        setResponseText(appeal.response || "");
    };

    const handleDelete = async (id) => {
        if (window.confirm("Вы уверены, что хотите удалить это обращение?")) {
            try {
                await apiClient.delete(`/admin/appeals/${id}`);
                showSuccess("Обращение удалено");
                fetchAppeals();
            } catch (error) {
                showError(error);
            }
        }
    };

    const handleSaveResponse = async () => {
        try {
            const updateData = {
                status: "resolved",
                response: responseText,
            };

            await apiClient.put(
                `/admin/appeals/${selectedAppeal.id}`,
                updateData
            );

            showSuccess("Ответ сохранен");
            setSelectedAppeal(null);
            fetchAppeals();
        } catch (error) {
            showError(error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <>
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
                    maxWidth={false}
                    sx={{
                        pt: { xs: 14, sm: 8 },
                        pb: { xs: 4, sm: 4 },
                        width: "100%",
                        mb: 3,
                    }}
                >
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
                        Обращения
                        <Typography
                            component="span"
                            variant="h2"
                            color="primary"
                            sx={{ fontWeight: "bold" }}
                        >
                            пользователей
                        </Typography>
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ color: "primary.main", mb: 0.5 }}
                    >
                        Статус
                    </Typography>
                    <TextField
                        select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                        sx={{ mb: 2, minWidth: 120 }}
                        SelectProps={{
                            displayEmpty: true,
                            renderValue:
                                statusFilter !== "all"
                                    ? undefined
                                    : () => "Все статусы",
                        }}
                    >
                        <MenuItem value="all">Все статусы</MenuItem>
                        <MenuItem value="new">Новые</MenuItem>
                        <MenuItem value="resolved">Отвеченные</MenuItem>
                    </TextField>

                    {appeals?.length > 0 && (
                        <Stack spacing={4}>
                            {appeals.map((appeal) => (
                                <Card
                                    key={appeal.id}
                                    sx={{
                                        boxShadow: 3,
                                        borderRadius: 2,
                                        mb: 3,
                                        position: "relative",
                                    }}
                                >
                                    <CardContent>
                                        {/* Верхняя строка: Имя и Статус */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                flexWrap: "wrap",
                                                mb: 2,
                                                gap: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="h4"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {appeal.name || "Без имени"}
                                            </Typography>

                                            {appeal.status && (
                                                <Chip
                                                    label={
                                                        statusLabels[
                                                            appeal.status
                                                        ].label
                                                    }
                                                    color={
                                                        statusLabels[
                                                            appeal.status
                                                        ].color
                                                    }
                                                    sx={{
                                                        fontWeight: "bold",
                                                        minWidth: 120,
                                                        textTransform:
                                                            "uppercase",
                                                        fontSize: "0.75rem",
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        {/* Текст обращения */}
                                        {appeal.message?.length > 0 && (
                                            <Box sx={{ mb: 3 }}>
                                                <Typography
                                                    paragraph
                                                    sx={{
                                                        fontSize: "1.1rem",
                                                        color: "text.secondary",
                                                        whiteSpace: "pre-wrap",
                                                        lineHeight: 1.6,
                                                        backgroundColor:
                                                            "action.hover",
                                                        p: 2,
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    {appeal.message}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Нижняя строка: Контакты и Дата */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-end",
                                                flexWrap: "wrap",
                                                gap: 2,
                                                pt: 2,
                                                borderTop: "1px solid",
                                                borderColor: "divider",
                                            }}
                                        >
                                            <Stack
                                                direction="column"
                                                spacing={1}
                                            >
                                                {/* Контакт: Email */}
                                                {appeal.email && (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Email
                                                            fontSize="small"
                                                            sx={{
                                                                color: "text.secondary",
                                                            }}
                                                        />
                                                        <Link
                                                            href={`mailto:${appeal.email}`}
                                                            sx={{
                                                                color: "primary.main",
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {appeal.email}
                                                        </Link>
                                                    </Box>
                                                )}

                                                {/* Дата создания */}
                                                {appeal.created_at && (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                            color: "text.secondary",
                                                        }}
                                                    >
                                                        <CalendarToday fontSize="small" />
                                                        <Typography variant="body2">
                                                            {new Date(
                                                                appeal.created_at
                                                            ).toLocaleDateString(
                                                                "ru-RU",
                                                                {
                                                                    day: "numeric",
                                                                    month: "long",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Stack>

                                            {/* Кнопки - абсолютное позиционирование */}
                                            <Box
                                                sx={{ display: "flex", gap: 1 }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    disabled={
                                                        appeal.status === "new"
                                                    }
                                                    onClick={() =>
                                                        handleDelete(appeal.id)
                                                    }
                                                >
                                                    Удалить
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={() =>
                                                        handleOpenDialog(appeal)
                                                    }
                                                >
                                                    Ответить
                                                </Button>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}

                    {appeals?.length === 0 && (
                        <Typography
                            variant="h5"
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
                            Нет обращений пользователей
                        </Typography>
                    )}
                </Container>
            </Box>

            <Dialog
                open={!!selectedAppeal}
                onClose={() => setSelectedAppeal(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Ответ на обращение #{selectedAppeal?.id}
                </DialogTitle>
                <DialogContent>
                    <StyledTextArea
                        label="Ответ"
                        multiline
                        rows={4}
                        fullWidth
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedAppeal(null)}>
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveResponse}
                        disabled={!responseText.trim()}
                    >
                        Ответить
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AdminAppealsPage;
