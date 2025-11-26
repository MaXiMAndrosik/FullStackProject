import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    MenuItem, // Добавляем MenuItem
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";
import { showError } from "../../../../shared/services/notificationService";
import { format, addMonths, endOfMonth } from "date-fns"; // Добавляем функции date-fns

const TariffCalculatorDialog = ({
    open,
    onClose,
    service,
    apartments,
    onSubmit,
    startDate,
}) => {
    const [totalCost, setTotalCost] = useState("");
    const [consumption, setConsumption] = useState("");
    const [calculatedTariff, setCalculatedTariff] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Добавляем состояния для рассрочки
    const [installmentOption, setInstallmentOption] = useState("off");
    const [installmentMonths, setInstallmentMonths] = useState(1);

    // Сброс состояния при открытии/закрытии диалога
    useEffect(() => {
        if (open) {
            setTotalCost("");
            setConsumption("");
            setCalculatedTariff(null);
            setValidationResult(null);
            setLoading(false);
            // Сбрасываем рассрочку при открытии
            setInstallmentOption("off");
            setInstallmentMonths(1);
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

    // Функция для расчета даты окончания рассрочки
    const calculateEndDate = () => {
        if (installmentOption !== "on") return null;
        const start = new Date(startDate);
        const endDate = endOfMonth(addMonths(start, installmentMonths - 1));
        return format(endDate, "yyyy-MM-dd");
    };

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

            let tariff, monthlyTariff, validation;

            if (installmentOption === "on") {
                // Расчет с рассрочкой
                const months = parseInt(installmentMonths) || 1;
                if (months < 1) {
                    throw new Error(
                        "Количество месяцев должно быть не меньше 1"
                    );
                }

                // Общий тариф без рассрочки
                tariff = costValue / baseValue;
                // Месячный тариф с рассрочкой
                monthlyTariff = tariff / months;

                const formattedMonthlyTariff = parseFloat(
                    monthlyTariff.toFixed(4)
                );
                const formattedTariff = parseFloat(tariff.toFixed(4));

                // Проверка расчетов
                const calculatedTotal =
                    formattedMonthlyTariff * baseValue * months;
                const difference = Math.abs(calculatedTotal - costValue);
                const isExact = difference < 0.01;

                validation = {
                    type: "installment",
                    totalCalculated: calculatedTotal,
                    originalTotal: costValue,
                    difference,
                    isExact,
                    months,
                    monthlyTariff: formattedMonthlyTariff,
                    baseTariff: formattedTariff,
                };

                setCalculatedTariff(formattedMonthlyTariff);
            } else {
                // Расчет без рассрочки
                tariff = costValue / baseValue;
                const tariffValue = tariff.toFixed(4);

                // Проверяем точность тарифа
                const calculatedTotal = parseFloat(
                    (parseFloat(tariffValue) * baseValue).toFixed(2)
                );
                const difference = Math.abs(calculatedTotal - costValue);
                const isExact = difference < 0.01;

                validation = {
                    type: "single",
                    calculatedTotal,
                    originalTotal: costValue,
                    difference,
                    isExact,
                    formattedTariff: parseFloat(tariffValue),
                };

                setCalculatedTariff(parseFloat(tariffValue));
            }

            setValidationResult(validation);
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Применение результата
    const applyTariff = () => {
        if (calculatedTariff !== null) {
            if (installmentOption === "on") {
                // Возвращаем объект с данными рассрочки
                const months = parseInt(installmentMonths) || 1;
                const endDate = calculateEndDate();

                onSubmit({
                    rate: calculatedTariff,
                    start_date: startDate,
                    end_date: endDate,
                    is_installment: true,
                    installment_months: months,
                });
            } else {
                // Возвращаем просто число
                onSubmit(calculatedTariff);
            }
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

                <StyledTextArea
                    label="Дата начала тарифа"
                    type="date"
                    value={startDate}
                    fullWidth
                    margin="normal"
                    required
                    disabled={true}
                    InputLabelProps={{ shrink: true }}
                    helperText={"Дата начала не может быть изменена"}
                />

                <StyledTextArea
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
                    <StyledTextArea
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

                {/* Блок рассрочки */}
                <StyledTextArea
                    label="Рассрочка платежа"
                    select
                    value={installmentOption}
                    onChange={(e) => setInstallmentOption(e.target.value)}
                    fullWidth
                    margin="normal"
                >
                    <MenuItem value="off">Рассрочка отключена</MenuItem>
                    <MenuItem value="on">Рассрочка включена</MenuItem>
                </StyledTextArea>

                {installmentOption === "on" && (
                    <>
                        <StyledTextArea
                            label="Количество месяцев"
                            type="number"
                            value={installmentMonths}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value >= 1) setInstallmentMonths(value);
                            }}
                            fullWidth
                            margin="normal"
                            required
                            inputProps={{ min: 1 }}
                        />
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mt: 1, mb: 2 }}
                        >
                            Дата окончания будет автоматически установлена:{" "}
                            {calculateEndDate()}
                        </Typography>
                    </>
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

                                {validationResult.type === "single" ? (
                                    // Без рассрочки
                                    <>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            <strong>Рассчитанный тариф:</strong>{" "}
                                            {calculatedTariff} {getUnitLabel()}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            <strong>Порядок расчета:</strong>{" "}
                                            Общая стоимость /{" "}
                                            {service?.calculation_type ===
                                            "area"
                                                ? "Общая площадь дома"
                                                : "Общее потребление"}{" "}
                                            = {totalCost} /{" "}
                                            {service?.calculation_type ===
                                            "area"
                                                ? totalArea
                                                : consumption}{" "}
                                            = {calculatedTariff}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            <strong>Проверка:</strong> Тариф ×{" "}
                                            {service?.calculation_type ===
                                            "area"
                                                ? "Общая площадь дома"
                                                : "Общее потребление"}{" "}
                                            = {calculatedTariff} ×{" "}
                                            {service?.calculation_type ===
                                            "area"
                                                ? totalArea
                                                : consumption}{" "}
                                            ={" "}
                                            {validationResult.calculatedTotal?.toFixed(
                                                2
                                            ) || "0.00"}{" "}
                                            руб
                                        </Typography>
                                    </>
                                ) : (
                                    // С рассрочкой
                                    <>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            <strong>
                                                Рассчитанный тариф в месяц:
                                            </strong>{" "}
                                            {calculatedTariff} {getUnitLabel()}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            <strong>Дата начала:</strong>{" "}
                                            {startDate}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            <strong>Дата окончания:</strong>{" "}
                                            {calculateEndDate()}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            <strong>
                                                Общий тариф без рассрочки:
                                            </strong>{" "}
                                            {validationResult.baseTariff?.toFixed(
                                                4
                                            )}{" "}
                                            {getUnitLabel()}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            <strong>Порядок расчета:</strong>{" "}
                                            (Общая стоимость /{" "}
                                            {service?.calculation_type ===
                                            "area"
                                                ? "Общая площадь дома"
                                                : "Общее потребление"}{" "}
                                            ) / {validationResult.months}{" "}
                                            месяцев = ({totalCost} /{" "}
                                            {service?.calculation_type ===
                                            "area"
                                                ? totalArea
                                                : consumption}{" "}
                                            ) / {validationResult.months} ={" "}
                                            {calculatedTariff}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            <strong>Проверка:</strong> Тариф ×{" "}
                                            {service?.calculation_type ===
                                            "area"
                                                ? "Общая площадь дома"
                                                : "Общее потребление"}{" "}
                                            × {validationResult.months} месяцев
                                            = {calculatedTariff} ×{" "}
                                            {service?.calculation_type ===
                                            "area"
                                                ? totalArea
                                                : consumption}{" "}
                                            × {validationResult.months} ={" "}
                                            {validationResult.totalCalculated?.toFixed(
                                                2
                                            ) || "0.00"}{" "}
                                            руб
                                        </Typography>
                                    </>
                                )}

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
