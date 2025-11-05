import React, { useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Button,
    Grid,
    Divider,
} from "@mui/material";
import { Save as SaveIcon, Speed as SpeedIcon } from "@mui/icons-material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";

const OwnerMeterReadingCards = ({
    readingsData,
    loading,
    onSaveReading,
    services,
}) => {
    const [inputModes, setInputModes] = useState({});
    const [readingValues, setReadingValues] = useState({});
    const [consumptionValues, setConsumptionValues] = useState({});
    const [errors, setErrors] = useState({});

    // Упрощенная валидация
    const validateInput = (value, isReading = false, previousReading = 0) => {
        if (value === "" || value === null) {
            return { isValid: false, error: "Введите значение" };
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return { isValid: false, error: "Введите число" };
        }

        if (numValue < 0) {
            return {
                isValid: false,
                error: "Значение не может быть отрицательным",
            };
        }

        if (
            isReading &&
            previousReading !== null &&
            numValue < previousReading
        ) {
            return {
                isValid: false,
                error: `Показания не могут быть меньше предыдущих (${previousReading})`,
            };
        }

        return { isValid: true, error: "" };
    };

    // Получение начального значения для отображения
    const getInitialValue = (value, defaultValue = "") => {
        if (value === null || value === undefined) return defaultValue;
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) return defaultValue;
        return numValue.toString();
    };

    // Обработчик переключения режима ввода
    const handleInputModeChange = (meterId, newMode, item) => {
        const currentMode = inputModes[meterId] || "reading";

        // Если переключаемся с показаний на расход - пересчитываем расход
        if (currentMode === "reading" && newMode === "consumption") {
            const readingValue =
                readingValues[meterId] ?? getInitialValue(item.currentReading);
            if (readingValue && item.previousReading !== null) {
                const consumption =
                    parseFloat(readingValue) - item.previousReading;
                if (consumption >= 0) {
                    setConsumptionValues((prev) => ({
                        ...prev,
                        [meterId]: consumption.toString(),
                    }));
                }
            }
        }
        // Если переключаемся с расхода на показания - пересчитываем показания
        else if (currentMode === "consumption" && newMode === "reading") {
            const consumptionValue =
                consumptionValues[meterId] ??
                getInitialValue(item.currentConsumption);
            if (consumptionValue && item.previousReading !== null) {
                const reading =
                    item.previousReading + parseFloat(consumptionValue);
                setReadingValues((prev) => ({
                    ...prev,
                    [meterId]: reading.toString(),
                }));
            }
        }

        setInputModes((prev) => ({ ...prev, [meterId]: newMode }));
        setErrors((prev) => ({ ...prev, [meterId]: "" }));
    };

    // Обработчик изменения показаний
    const handleReadingChange = (meterId, value, item) => {
        setReadingValues((prev) => ({ ...prev, [meterId]: value }));

        const validation = validateInput(value, true, item.previousReading);
        setErrors((prev) => ({ ...prev, [meterId]: validation.error }));

        // Автоматически пересчитываем расход
        if (validation.isValid && value && item.previousReading !== null) {
            const consumption = parseFloat(value) - item.previousReading;
            if (consumption >= 0) {
                setConsumptionValues((prev) => ({
                    ...prev,
                    [meterId]: consumption.toString(),
                }));
            }
        }
    };

    // Обработчик изменения расхода
    const handleConsumptionChange = (meterId, value, item) => {
        setConsumptionValues((prev) => ({ ...prev, [meterId]: value }));

        const validation = validateInput(value, false);
        setErrors((prev) => ({ ...prev, [meterId]: validation.error }));

        // Автоматически пересчитываем показания
        if (validation.isValid && value && item.previousReading !== null) {
            const reading = item.previousReading + parseFloat(value);
            setReadingValues((prev) => ({
                ...prev,
                [meterId]: reading.toString(),
            }));
        }
    };

    // Обработчик сохранения
    const handleSave = (meterId) => {
        const inputMode = inputModes[meterId] || "reading";
        const item = readingsData.find((item) => item.id === meterId);

        let valueToSend;
        let validation;
        let isConsumptionInput = false;

        if (inputMode === "reading") {
            const readingValue =
                readingValues[meterId] ?? getInitialValue(item.currentReading);
            validation = validateInput(
                readingValue,
                true,
                item.previousReading
            );
            valueToSend = readingValue ? parseFloat(readingValue) : null;
            isConsumptionInput = false;
        } else {
            const consumptionValue =
                consumptionValues[meterId] ??
                getInitialValue(item.currentConsumption);
            validation = validateInput(consumptionValue, false);
            valueToSend = consumptionValue
                ? parseFloat(consumptionValue)
                : null;
            isConsumptionInput = true;
        }

        if (!validation.isValid) {
            setErrors((prev) => ({ ...prev, [meterId]: validation.error }));
            return;
        }

        onSaveReading(
            meterId,
            inputMode === "reading" ? valueToSend : null,
            inputMode === "consumption" ? valueToSend : null,
            isConsumptionInput
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "н/д";
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            month: "long",
            year: "numeric",
        });
    };

    const formatValue = (value) => {
        if (value === null || value === undefined) return "н/д";
        return value.toLocaleString("ru-RU");
    };

    const getTariffForMeter = (meterType) => {
        const serviceName = serviceTypeMapping[meterType] || meterType;
        const service = services.find((s) => s.name === serviceName);

        if (service && service.current_tariff) {
            return {
                rate: service.current_tariff.rate,
                unit: service.current_tariff.unit,
                startDate: service.current_tariff.start_date,
            };
        }
        return null;
    };

    const formatTariffRate = (rate) => {
        if (!rate) return "0.00";
        return parseFloat(rate).toFixed(4);
    };

    const unitLabels = {
        m2: "м²",
        gcal: "Гкал",
        m3: "м³",
        kwh: "кВт·ч",
    };

    const serviceTypeMapping = {
        Газоснабжение: "Газоснабжение",
        Электроснабжение: "Электроснабжение",
        "Холодная вода": "Водоснабжение",
        Водоотведение: "Водоотведение",
        "Горячая вода": "Горячее водоснабжение (подогрев воды)",
        Отопление: "Теплоснабжение (отопление)",
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (readingsData.length === 0) {
        return (
            <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "center",
                    my: 8,
                }}
            >
                <Box component="span">📊</Box>
                Нет данных для отображения
            </Typography>
        );
    }

    return (
        <Box>
            <Grid container spacing={4}>
                {readingsData.map((item) => {
                    const currentInputMode = inputModes[item.id] || "reading";

                    const currentReadingValue =
                        readingValues[item.id] ??
                        getInitialValue(item.currentReading);
                    const currentConsumptionValue =
                        consumptionValues[item.id] ??
                        getInitialValue(item.currentConsumption);

                    const error = errors[item.id] || "";
                    const tariff = getTariffForMeter(item.type);

                    // Определяем, можно ли сохранять
                    let canSave = false;
                    if (currentInputMode === "reading") {
                        const validation = validateInput(
                            currentReadingValue,
                            true,
                            item.previousReading
                        );
                        canSave =
                            currentReadingValue !== "" && validation.isValid;
                    } else {
                        const validation = validateInput(
                            currentConsumptionValue,
                            false
                        );
                        canSave =
                            currentConsumptionValue !== "" &&
                            validation.isValid;
                    }

                    return (
                        <Grid
                            key={item.id}
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
                                <CardContent sx={{ p: 3 }}>
                                    {/* Заголовок карточки */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 2,
                                            }}
                                        >
                                            <SpeedIcon
                                                color="primary"
                                                sx={{ fontSize: 32, mt: 0.5 }}
                                            />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography
                                                    variant="h6"
                                                    component="h3"
                                                    sx={{ mb: 0.5 }}
                                                >
                                                    Счетчик: {item.type}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 0.5 }}
                                                >
                                                    Серийный номер:{" "}
                                                    {item.serialNumber || "н/д"}
                                                </Typography>
                                                {item.nextVerificationDate && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        Поверен до:{" "}
                                                        {new Date(
                                                            item.nextVerificationDate
                                                        ).toLocaleDateString(
                                                            "ru-RU"
                                                        )}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Строка тарифа */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mt: 2,
                                                p: 1,
                                                backgroundColor: "action.hover",
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Тариф:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                            >
                                                {tariff
                                                    ? `${formatTariffRate(
                                                          tariff.rate
                                                      )} руб/${
                                                          unitLabels[
                                                              tariff.unit
                                                          ] || tariff.unit
                                                      }`
                                                    : "Не указан"}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

                                    {/* Предыдущие показания */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            p: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="subtitle2"
                                                gutterBottom
                                            >
                                                Предыдущие показания:
                                            </Typography>
                                            <Typography variant="body2">
                                                за{" "}
                                                {formatDate(
                                                    item.previousPeriod
                                                )}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                        >
                                            {formatValue(item.previousReading)}{" "}
                                            {unitLabels[item.unit]}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

                                    <Box sx={{ mb: 2 }}>
                                        {/* Кнопки выбора режима ввода */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                mb: 2,
                                            }}
                                        >
                                            <Button
                                                variant={
                                                    currentInputMode ===
                                                    "reading"
                                                        ? "contained"
                                                        : "outlined"
                                                }
                                                color={
                                                    currentInputMode ===
                                                    "reading"
                                                        ? "secondary"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    handleInputModeChange(
                                                        item.id,
                                                        "reading",
                                                        item
                                                    )
                                                }
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    fontWeight:
                                                        currentInputMode ===
                                                        "reading"
                                                            ? "bold"
                                                            : "normal",
                                                }}
                                            >
                                                Показания
                                            </Button>
                                            <Button
                                                variant={
                                                    currentInputMode ===
                                                    "consumption"
                                                        ? "contained"
                                                        : "outlined"
                                                }
                                                color={
                                                    currentInputMode ===
                                                    "consumption"
                                                        ? "secondary"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    handleInputModeChange(
                                                        item.id,
                                                        "consumption",
                                                        item
                                                    )
                                                }
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    fontWeight:
                                                        currentInputMode ===
                                                        "consumption"
                                                            ? "bold"
                                                            : "normal",
                                                }}
                                            >
                                                Потребление
                                            </Button>
                                        </Box>

                                        {/* Поле ввода */}
                                        {currentInputMode === "reading" ? (
                                            <StyledTextArea
                                                fullWidth
                                                label="Текущие показания"
                                                type="number"
                                                value={currentReadingValue}
                                                onChange={(e) =>
                                                    handleReadingChange(
                                                        item.id,
                                                        e.target.value,
                                                        item
                                                    )
                                                }
                                                error={!!error}
                                                helperText={error}
                                                InputProps={{
                                                    endAdornment: (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {unitLabels[
                                                                item.unit
                                                            ] || item.unit}
                                                        </Typography>
                                                    ),
                                                }}
                                            />
                                        ) : (
                                            <StyledTextArea
                                                fullWidth
                                                label="Расход"
                                                type="number"
                                                value={currentConsumptionValue}
                                                onChange={(e) =>
                                                    handleConsumptionChange(
                                                        item.id,
                                                        e.target.value,
                                                        item
                                                    )
                                                }
                                                error={!!error}
                                                helperText={error}
                                                InputProps={{
                                                    endAdornment: (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {unitLabels[
                                                                item.unit
                                                            ] || item.unit}
                                                        </Typography>
                                                    ),
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

                                    {/* Кнопка Сохранить */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 1,
                                            flexWrap: "wrap",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Button
                                            variant={
                                                canSave
                                                    ? "contained"
                                                    : "outlined"
                                            }
                                            color={canSave ? "secondary" : ""}
                                            startIcon={<SaveIcon />}
                                            onClick={() => handleSave(item.id)}
                                            size="small"
                                            disabled={!canSave}
                                            sx={{
                                                minWidth: {
                                                    xs: "100%",
                                                    sm: 240,
                                                },
                                            }}
                                        >
                                            Отправить
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default OwnerMeterReadingCards;
