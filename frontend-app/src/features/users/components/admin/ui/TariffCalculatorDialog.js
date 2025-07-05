import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
} from "@mui/material";
import { showError } from "../../../../../shared/services/notificationService";

const TariffCalculatorDialog = ({
    open,
    onClose,
    service,
    apartments,
    onSubmit,
}) => {
    const [totalCost, setTotalCost] = useState("");
    const [consumption, setConsumption] = useState("");
    const [calculatedTariff, setCalculatedTariff] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Сброс состояния при открытии/закрытии диалога
    useEffect(() => {
        if (open) {
            setTotalCost("");
            setConsumption("");
            setCalculatedTariff(null);
            setValidationResult(null);
            setLoading(false);
        }
    }, [open]);

    // Рассчитываем общую площадь всего дома
    const calculateTotalArea = () => {
        if (!apartments || apartments.length === 0) return "0.00";

        return apartments
            .reduce((sum, apartment) => {
                return sum + (parseFloat(apartment.area) || 0);
            }, 0)
            .toFixed(2);
    };

    // Общая площадь дома
    const totalArea =
        service?.calculation_type === "area" ? calculateTotalArea() : "0.00";

    // Проверка рассчитанного тарифа
    const validateTariff = (tariff, baseValue, totalCost) => {
        const base = parseFloat(baseValue);
        const tariffValue = parseFloat(tariff);
        const cost = parseFloat(totalCost);

        if (isNaN(base) || isNaN(tariffValue) || isNaN(cost)) {
            return null;
        }

        const calculatedTotal = parseFloat((tariffValue * base).toFixed(2));
        const difference = Math.abs(calculatedTotal - cost);

        return {
            calculatedTotal,
            originalTotal: cost,
            difference,
            isExact: difference < 0.01,
        };
    };

    // Расчет тарифа
    const calculateTariff = () => {
        if (!totalCost) return;

        setLoading(true);

        try {
            const costValue = parseFloat(totalCost);
            if (isNaN(costValue)) {
                throw new Error("Введите корректную стоимость");
            }

            let baseValue;
            if (service?.calculation_type === "area") {
                const areaValue = parseFloat(totalArea);
                if (isNaN(areaValue) || areaValue <= 0) {
                    throw new Error("Ошибка расчета площади дома");
                }
                baseValue = areaValue;
            } else if (service?.calculation_type === "meter") {
                const consumptionValue = parseFloat(consumption);
                if (isNaN(consumptionValue) || consumptionValue <= 0) {
                    throw new Error("Введите объем потребления");
                }
                baseValue = consumptionValue;
            } else {
                throw new Error(
                    "Расчет доступен только для услуг по площади или счетчику"
                );
            }

            const tariff = costValue / baseValue;
            const tariffValue = tariff.toFixed(4);

            // Проверяем точность тарифа
            const validation = validateTariff(
                tariffValue,
                baseValue,
                totalCost
            );
            setValidationResult(validation);

            setCalculatedTariff(tariffValue);
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Применение результата
    const applyTariff = () => {
        if (calculatedTariff) {
            onSubmit(calculatedTariff);
        }
    };

    // Единицы измерения
    const unitLabels = {
        m2: "руб/м²",
        gcal: "руб/Гкал",
        m3: "руб/м³",
        kwh: "руб/кВт·ч",
        fixed: "руб",
    };

    // Безопасное получение единицы измерения
    const getUnitLabel = () => {
        if (!service) return "руб";
        return unitLabels[service.unit] || "руб";
    };

    // Определяем, нужен ли ввод потребления
    const showConsumptionInput = service?.calculation_type === "meter";

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Рассчитать тариф для всего дома</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        mb: 2,
                    }}
                >
                    <Typography variant="body1" gutterBottom>
                        <strong>Услуга:</strong>{" "}
                        {service?.name || "Неизвестная услуга"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Тип расчета:</strong>{" "}
                        {service?.calculation_type === "area"
                            ? "По площади"
                            : service?.calculation_type === "meter"
                            ? "По счетчику"
                            : "Фиксированный"}
                    </Typography>

                    {service?.calculation_type === "area" && (
                        <Typography variant="body1" gutterBottom>
                            <strong>Общая площадь дома:</strong> {totalArea} м²
                        </Typography>
                    )}
                </Box>

                <TextField
                    label="Общая стоимость услуги для дома"
                    type="number"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    inputProps={{ step: "0.01" }}
                />

                {showConsumptionInput && (
                    <TextField
                        label={`Общее потребление (${service?.unit || "ед."})`}
                        type="number"
                        value={consumption}
                        onChange={(e) => setConsumption(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ step: "0.01", min: "0.01" }}
                    />
                )}

                {loading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 2,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <Button
                        variant="contained"
                        onClick={calculateTariff}
                        sx={{ mt: 2 }}
                        disabled={
                            !totalCost || (showConsumptionInput && !consumption)
                        }
                    >
                        Рассчитать тариф
                    </Button>
                )}

                {calculatedTariff !== null && validationResult && !loading && (
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            bgcolor: "background.paper",
                            borderRadius: 1,
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Результаты расчета:
                                </Typography>

                                <Typography variant="body1" gutterBottom>
                                    <strong>Рассчитанный тариф:</strong>{" "}
                                    {calculatedTariff} {getUnitLabel()}
                                </Typography>

                                <Typography variant="body1" gutterBottom>
                                    <strong>Порядок расчета:</strong> Общая стоимость /{" "}
                                    {service?.calculation_type === "area"
                                        ? "Общая площадь дома"
                                        : "Общее потребление"}{" "}
                                    = {totalCost} /{" "}
                                    {service?.calculation_type === "area"
                                        ? totalArea
                                        : consumption}{" "}
                                    = {calculatedTariff}
                                </Typography>

                                <Typography variant="body1" gutterBottom>
                                    <strong>Проверка:</strong> Тариф ×{" "}
                                    {service?.calculation_type === "area"
                                        ? "Общая площадь дома"
                                        : "Общее потребление"}{" "}
                                    = {calculatedTariff} ×{" "}
                                    {service?.calculation_type === "area"
                                        ? totalArea
                                        : consumption}{" "}
                                    ={" "}
                                    {validationResult.calculatedTotal?.toFixed(
                                        2
                                    ) || "0.00"}{" "}
                                    руб
                                </Typography>

                                {validationResult.isExact ? (
                                    <Alert severity="success" sx={{ mt: 2 }}>
                                        Тариф полностью покрывает затраты (
                                        {validationResult.originalTotal?.toFixed(
                                            2
                                        ) || "0.00"}{" "}
                                        руб)
                                    </Alert>
                                ) : (
                                    <Alert severity="warning" sx={{ mt: 2 }}>
                                        Обратный расчёт даёт{" "}
                                        {validationResult.calculatedTotal?.toFixed(
                                            2
                                        ) || "0.00"}{" "}
                                        руб вместо{" "}
                                        {validationResult.originalTotal?.toFixed(
                                            2
                                        ) || "0.00"}{" "}
                                        руб
                                        <br />
                                        <strong>Разница:</strong>{" "}
                                        {validationResult.difference?.toFixed(
                                            2
                                        ) || "0.00"}{" "}
                                        руб
                                        <br />
                                        Примите решение с учётом этой
                                        погрешности
                                    </Alert>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button
                    onClick={applyTariff}
                    variant="contained"
                    color="primary"
                    disabled={!calculatedTariff || loading}
                >
                    Применить тариф
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TariffCalculatorDialog;
