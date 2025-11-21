import React, { useState, useEffect } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import {
    Container,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Chip,
    Alert,
} from "@mui/material";
import apiClient from "../../../app/api/client";
import { format } from "date-fns";
import { showError } from "../../../shared/services/notificationService";

const OwnerServicesPage = () => {
    const [services, setServices] = useState([]);
    const [assignmentsServices, setAssignmentsServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        fetchServices();
        fetchAssignmentsServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        apiClient
            .get("/owner/services")
            .then((res) => setServices(res.data.data))
            .catch((error) => {
                showError("Ошибка загрузки услуг");
                setServices([]);
                setError("Ошибка загрузки данных об услугах");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchAssignmentsServices = () => {
        setLoading(true);
        apiClient
            .get("/owner/service-assignments")
            .then((res) => setAssignmentsServices(res.data.data))
            .catch((error) => {
                showError("Ошибка загрузки услуг");
                setAssignmentsServices([]);
                setError("Ошибка загрузки данных об услугах");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const formatDate = (dateString) => {
        return dateString ? format(new Date(dateString), "dd.MM.yyyy") : "";
    };

    // Функция для форматирования числа с удалением незначащих нулей
    const formatRate = (value) => {
        const formatted = parseFloat(value)
            .toFixed(4)
            .replace(/\.?0+$/, "");
        return formatted.includes(".") ? formatted : `${formatted}.0`;
    };

    // Единицы измерения
    const unitLabels = {
        m2: "руб/м²",
        gcal: "руб/Гкал",
        m3: "руб/м³",
        kwh: "руб/кВт·ч",
        fixed: "руб",
    };

    // Типы услуг
    const typeLabels = {
        main: { label: "Основная", color: "primary" },
        utility: { label: "Коммунальная", color: "secondary" },
        additional: { label: "Дополнительная", color: "info" },
        other: { label: "Прочее", color: "warning" },
    };

    // Объединяем все услуги для рендеринга
    const allServices = [...services, ...assignmentsServices];
    const hasServices = allServices.length > 0;

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ mt: 4, textAlign: "center" }}>
                    <Typography variant="h5" color="error">
                        {error}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Попробуйте обновить страницу позже
                    </Typography>
                </Box>
            </Container>
        );
    }

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
                        mb: 4,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                    }}
                >
                    Тарифы и
                    <Typography
                        component="span"
                        variant="h2"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                    >
                        услуги
                    </Typography>
                </Typography>
                <Box
                    sx={{
                        backgroundColor: "background.paper",
                        borderRadius: 2,
                        p: 4,
                        mb: 2,
                        boxShadow: 1,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="body1" fontWeight="bold">
                        На этой странице отображены все услуги, подключенные к
                        вашей квартире, с актуальными тарифами и датами их
                        действия.
                    </Typography>
                </Box>

                {!hasServices ? (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        У вас нет подключенных услуг
                    </Alert>
                ) : isSmallScreen ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {allServices.map((service) => {
                            const currentTariff = service.current_tariff;
                            const typeInfo = typeLabels[service.type] || {
                                label: service.type,
                                color: "default",
                            };

                            return (
                                <Paper
                                    key={service.id}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        boxShadow: 1,
                                        transition:
                                            "box-shadow 0.3s ease-in-out",
                                        "&:hover": {
                                            boxShadow: 3,
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Chip
                                            label={typeInfo.label}
                                            color={typeInfo.color}
                                            variant="outlined"
                                            size="small"
                                            sx={{ mb: 1 }}
                                        />

                                        {currentTariff && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                с{" "}
                                                {formatDate(
                                                    currentTariff.start_date
                                                )}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        sx={{ mb: 1 }}
                                    >
                                        {service.name}
                                    </Typography>

                                    {currentTariff ? (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                            >
                                                {formatRate(currentTariff.rate)}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ ml: 1 }}
                                            >
                                                {unitLabels[
                                                    currentTariff.unit
                                                ] || "руб"}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography color="textSecondary">
                                            Нет активного тарифа
                                        </Typography>
                                    )}
                                </Paper>
                            );
                        })}
                    </Box>
                ) : (
                    // Десктопный вид - таблица
                    <TableContainer
                        component={Paper}
                        sx={{
                            mb: 2,
                            boxShadow: 1,
                            borderRadius: 2,
                            overflow: "hidden",
                        }}
                    >
                        <Table>
                            <TableHead sx={{ bgcolor: "primary.main" }}>
                                <TableRow>
                                    <TableCell sx={{ color: "white" }}>
                                        Тип услуги
                                    </TableCell>
                                    <TableCell sx={{ color: "white" }}>
                                        Услуга
                                    </TableCell>
                                    <TableCell sx={{ color: "white" }}>
                                        Текущий тариф
                                    </TableCell>
                                    <TableCell sx={{ color: "white" }}>
                                        Действует с
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allServices.map((service) => {
                                    const currentTariff =
                                        service.current_tariff;
                                    const typeInfo = typeLabels[
                                        service.type
                                    ] || {
                                        label: service.type,
                                        color: "default",
                                    };

                                    return (
                                        <TableRow
                                            key={service.id}
                                            sx={{
                                                "&:last-child td, &:last-child th":
                                                    { border: 0 },
                                                "&:hover": {
                                                    backgroundColor:
                                                        "action.hover",
                                                },
                                            }}
                                        >
                                            <TableCell>
                                                <Chip
                                                    label={typeInfo.label}
                                                    color={typeInfo.color}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight="bold">
                                                    {service.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {currentTariff ? (
                                                    <>
                                                        <Typography fontWeight="bold">
                                                            {formatRate(
                                                                currentTariff.rate
                                                            )}{" "}
                                                            {unitLabels[
                                                                currentTariff
                                                                    .unit
                                                            ] || "руб"}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <Typography color="textSecondary">
                                                        Нет активного тарифа
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {currentTariff
                                                    ? formatDate(
                                                          currentTariff.start_date
                                                      )
                                                    : "-"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Box
                    sx={{
                        mt: 4,
                        p: 3,
                        backgroundColor: "background.paper",
                        borderRadius: 2,
                        mb: 2,
                        boxShadow: 1,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        О тарифах
                    </Typography>
                    <Typography variant="body1">
                        Тарифы на услуги устанавливаются управляющей компанией и
                        могут изменяться в соответствии с законодательством.
                        Актуальные тарифы всегда отображаются в этом разделе и
                        учитываются при формировании квитанций.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default OwnerServicesPage;
