import React, { useState, useMemo } from "react";
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
    Alert,
} from "@mui/material";

const AssignmentTariffCalculatorDialog = ({
    open,
    onClose,
    serviceAssignment,
    apartments,
    onSubmit,
}) => {
    const [totalCost, setTotalCost] = useState("");
    const [totalArea, setTotalArea] = useState("");
    const [consumption, setConsumption] = useState("");
    const [calculatedTariff, setCalculatedTariff] = useState(null);
    const [validationResult, setValidationResult] = useState(null);

    // Рассчитываем общую площадь для подъезда
    const calculateEntranceArea = useMemo(() => {
        if (serviceAssignment.scope !== "entrance") return 0;

        const entranceApartments = apartments.filter(
            (a) => a.entrance === serviceAssignment.entrance
        );

        return entranceApartments.reduce((sum, apartment) => {
            return sum + (parseFloat(apartment.area) || 0);
        }, 0);
    }, [serviceAssignment, apartments]);

    // Площадь подъезда (для услуг по площади)
    const entranceArea =
        serviceAssignment.scope === "entrance" &&
        serviceAssignment.calculation_type === "area"
            ? calculateEntranceArea.toFixed(2)
            : 0;

    // Инициализация полей
    useState(() => {
        if (serviceAssignment.calculation_type === "area") {
            setTotalArea(entranceArea);
        }
    }, []);

    // Проверка рассчитанного тарифа
    const validateTariff = (tariff, baseValue, totalCost) => {
        const calculatedTotal = parseFloat((tariff * baseValue).toFixed(2));
        const originalTotal = parseFloat(totalCost);
        const difference = Math.abs(calculatedTotal - originalTotal);

        return {
            calculatedTotal,
            originalTotal,
            difference,
            isExact: difference < 0.01,
        };
    };

    // Расчет тарифа
    const calculateTariff = () => {
        if (!totalCost) return;

        let baseValue;
        const costValue = parseFloat(totalCost);

        if (isNaN(costValue)) {
            alert("Введите корректную стоимость");
            return;
        }

        if (serviceAssignment.calculation_type === "area") {
            const areaValue = parseFloat(totalArea);

            if (isNaN(areaValue) || areaValue <= 0) {
                alert("Введите корректную площадь");
                return;
            }

            baseValue = areaValue;
        } else {
            const consumptionValue = parseFloat(consumption);

            if (isNaN(consumptionValue) || consumptionValue <= 0) {
                alert("Введите корректный объем потребления");
                return;
            }

            baseValue = consumptionValue;
        }

        const tariff = costValue / baseValue;
        const tariffValue = parseFloat(tariff.toFixed(4));

        // Проверяем точность тарифа
        const validation = validateTariff(tariffValue, baseValue, totalCost);
        setValidationResult(validation);

        setCalculatedTariff(tariffValue);
    };

    // Применение результата
    const applyTariff = () => {
        if (calculatedTariff) {
            onSubmit(calculatedTariff);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Рассчитать тариф</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                    }}
                >
                    <Typography variant="body1" gutterBottom>
                        <strong>Услуга:</strong> {serviceAssignment.name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Тип расчета:</strong>{" "}
                        {serviceAssignment.calculation_type === "area"
                            ? "По площади"
                            : "По счетчику"}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Объект:</strong>{" "}
                        {serviceAssignment.scope === "apartment"
                            ? serviceAssignment.apartment_info ||
                              `Квартира ${serviceAssignment.apartment_id}`
                            : `Подъезд ${serviceAssignment.entrance}`}
                    </Typography>
                    {serviceAssignment.scope === "entrance" &&
                        serviceAssignment.calculation_type === "area" && (
                            <Typography variant="body1" gutterBottom>
                                <strong>Общая площадь подъезда:</strong>{" "}
                                {entranceArea} м²
                            </Typography>
                        )}
                </Box>

                <TextField
                    label="Общая стоимость услуги"
                    type="number"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    inputProps={{ step: "0.01" }}
                />

                {serviceAssignment.calculation_type === "area" && (
                    <TextField
                        label="Общая площадь (м²)"
                        type="number"
                        value={totalArea}
                        onChange={(e) => setTotalArea(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ step: "0.01" }}
                    />
                )}

                {serviceAssignment.calculation_type === "meter" && (
                    <TextField
                        label="Объем потребления"
                        type="number"
                        value={consumption}
                        onChange={(e) => setConsumption(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ step: "0.01" }}
                    />
                )}

                <Button
                    variant="contained"
                    onClick={calculateTariff}
                    sx={{ mt: 2 }}
                    disabled={!totalCost}
                >
                    Рассчитать тариф
                </Button>

                {calculatedTariff !== null && validationResult && (
                    <Box
                        sx={{
                            mt: 1,
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
                                    {calculatedTariff}{" "}
                                    {serviceAssignment.calculation_type ===
                                    "area"
                                        ? "руб/м²"
                                        : `руб/${serviceAssignment.unit}`}
                                </Typography>

                                <Typography variant="body1" gutterBottom>
                                    <strong>Порядок расчета:</strong> Общая стоимость /{" "}
                                    {serviceAssignment.calculation_type ===
                                    "area"
                                        ? "Общая площадь"
                                        : "Потребление"}{" "}
                                    = {totalCost} /{" "}
                                    {serviceAssignment.calculation_type ===
                                    "area"
                                        ? totalArea
                                        : consumption}{" "}
                                    = {calculatedTariff}
                                </Typography>

                                <Typography variant="body1" gutterBottom>
                                    <strong>Проверка:</strong> Тариф × База ={" "}
                                    {calculatedTariff} ×{" "}
                                    {serviceAssignment.calculation_type ===
                                    "area"
                                        ? totalArea
                                        : consumption}{" "}
                                    ={" "}
                                    {validationResult.calculatedTotal.toFixed(
                                        2
                                    )}{" "}
                                    руб
                                </Typography>

                                {validationResult.isExact ? (
                                    <Alert severity="success" sx={{ mt: 2 }}>
                                        Тариф полностью покрывает затраты (
                                        {validationResult.originalTotal.toFixed(
                                            2
                                        )}{" "}
                                        руб)
                                    </Alert>
                                ) : (
                                    <Alert severity="warning" sx={{ mt: 2 }}>
                                        Обратный расчёт даёт{" "}
                                        {validationResult.calculatedTotal.toFixed(
                                            2
                                        )}{" "}
                                        руб вместо{" "}
                                        {validationResult.originalTotal.toFixed(
                                            2
                                        )}{" "}
                                        руб
                                        <br />
                                        <strong>Разница:</strong>{" "}
                                        {validationResult.difference.toFixed(2)}{" "}
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
                    disabled={!calculatedTariff}
                >
                    Применить тариф
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignmentTariffCalculatorDialog;
