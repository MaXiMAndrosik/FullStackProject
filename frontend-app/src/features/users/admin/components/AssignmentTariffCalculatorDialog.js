import React, { useState, useMemo, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    Alert,
    MenuItem,
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";
import { format, addMonths, endOfMonth } from "date-fns";

const AssignmentTariffCalculatorDialog = ({
    open,
    onClose,
    serviceAssignment,
    apartments,
    onSubmit,
    initialStartDate = "", // Добавляем пропс для начальной даты
}) => {
    const [totalCost, setTotalCost] = useState("");
    const [totalArea, setTotalArea] = useState("");
    const [consumption, setConsumption] = useState("");
    const [calculatedTariff, setCalculatedTariff] = useState(null);
    const [validationResult, setValidationResult] = useState(null);

    // Упрощенные состояния для рассрочки
    const [installmentOption, setInstallmentOption] = useState("off");
    const [installmentMonths, setInstallmentMonths] = useState(1);

    // Используем переданную дату начала или текущую дату по умолчанию
    const [startDate, setStartDate] = useState(
        initialStartDate || format(new Date(), "yyyy-MM-dd")
    );

    // Обновляем состояние startDate при изменении initialStartDate
    useEffect(() => {
        if (initialStartDate) {
            setStartDate(initialStartDate);
        }
    }, [initialStartDate]);

    // Функция для форматирования числа с 4 знаками после запятой
    const formatToFourDecimals = (value) => {
        return parseFloat(parseFloat(value).toFixed(4));
    };

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
    useEffect(() => {
        if (serviceAssignment.calculation_type === "area") {
            setTotalArea(entranceArea);
        }
    }, [serviceAssignment, entranceArea]);

    // База для расчета (площадь или потребление)
    const getBaseValue = () => {
        if (serviceAssignment.calculation_type === "area") {
            return parseFloat(totalArea) || 0;
        } else {
            return parseFloat(consumption) || 0;
        }
    };

    // Расчет даты окончания для рассрочки
    const calculateEndDate = () => {
        if (installmentOption !== "on") return null;

        const start = new Date(startDate);
        const endDate = endOfMonth(addMonths(start, installmentMonths - 1));
        return format(endDate, "yyyy-MM-dd");
    };

    // Расчет тарифа
    const calculateTariff = () => {
        if (!totalCost) {
            alert("Введите общую стоимость");
            return;
        }

        const baseValue = getBaseValue();
        if (baseValue <= 0) {
            alert("Введите корректную базу для расчета");
            return;
        }

        const costValue = parseFloat(totalCost);
        if (isNaN(costValue) || costValue <= 0) {
            alert("Введите корректную стоимость");
            return;
        }

        let tariff, monthlyTariff, validation;

        if (installmentOption === "on") {
            // Расчет с рассрочкой
            const months = parseInt(installmentMonths) || 1;
            if (months < 1) {
                alert("Количество месяцев должно быть не меньше 1");
                return;
            }

            // Общий тариф без рассрочки
            tariff = costValue / baseValue;
            // Месячный тариф с рассрочкой
            monthlyTariff = tariff / months;

            // Форматируем до 4 знаков
            const formattedMonthlyTariff = formatToFourDecimals(monthlyTariff);
            const formattedTariff = formatToFourDecimals(tariff);

            // Проверка расчетов с форматированными значениями
            const calculatedTotal = formattedMonthlyTariff * baseValue * months;
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

            // Форматируем до 4 знаков
            const formattedTariff = formatToFourDecimals(tariff);

            // Проверка расчетов с форматированным значением
            const calculatedTotal = formattedTariff * baseValue;
            const difference = Math.abs(calculatedTotal - costValue);
            const isExact = difference < 0.01;

            validation = {
                type: "single",
                calculatedTotal,
                originalTotal: costValue,
                difference,
                isExact,
                formattedTariff,
            };

            setCalculatedTariff(formattedTariff);
        }

        setValidationResult(validation);
    };

    // Применение результата
    const applyTariff = () => {
        if (calculatedTariff !== null) {
            // Убеждаемся, что передаем число с 4 знаками
            const formattedValue = formatToFourDecimals(calculatedTariff);

            // Если рассрочка включена, возвращаем объект с тарифом и датой окончания
            if (installmentOption === "on") {
                const months = parseInt(installmentMonths) || 1;
                const endDate = calculateEndDate();

                onSubmit({
                    rate: formattedValue,
                    start_date: startDate,
                    end_date: endDate,
                    is_installment: true,
                    installment_months: months,
                });
            } else {
                // Без рассрочки - возвращаем только rate
                onSubmit(formattedValue);
            }
        }
    };

    // Получаем единицу измерения для отображения
    const getUnitLabel = () => {
        const units = {
            m2: "руб/м²",
            gcal: "руб/Гкал",
            m3: "руб/м³",
            kwh: "руб/кВт·ч",
            fixed: "руб",
        };
        return units[serviceAssignment.unit] || "руб";
    };

    // Получаем базовую единицу для отображения
    const getBaseLabel = () => {
        return serviceAssignment.calculation_type === "area"
            ? "Общая площадь"
            : "Потребление";
    };

    // Получаем значение базы для отображения
    const getBaseValueDisplay = () => {
        return serviceAssignment.calculation_type === "area"
            ? totalArea
            : consumption;
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
                        mb: 2,
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
                    <Typography variant="body1">
                        <strong>Объект:</strong>{" "}
                        {serviceAssignment.scope === "apartment"
                            ? `Квартира ${serviceAssignment.apartment_id}`
                            : `Подъезд ${serviceAssignment.entrance}`}
                    </Typography>
                </Box>

                <StyledTextArea
                    label="Дата начала тарифа"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    InputLabelProps={{ shrink: true }}
                />

                <StyledTextArea
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
                    <StyledTextArea
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
                    <StyledTextArea
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

                <Button
                    variant="contained"
                    onClick={calculateTariff}
                    sx={{ mt: 2 }}
                    disabled={!totalCost}
                    fullWidth
                >
                    Рассчитать тариф
                </Button>

                {calculatedTariff !== null && validationResult && (
                    <Box
                        sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: "background.paper",
                            borderRadius: 1,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Результаты расчета:
                        </Typography>

                        {validationResult.type === "single" ? (
                            // Без рассрочки
                            <>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Рассчитанный тариф:</strong>{" "}
                                    {calculatedTariff.toFixed(4)}{" "}
                                    {getUnitLabel()}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Дата начала:</strong> {startDate}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Порядок расчета:</strong> Общая
                                    стоимость / {getBaseLabel()} = {totalCost} /{" "}
                                    {getBaseValueDisplay()} ={" "}
                                    {calculatedTariff.toFixed(4)}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Проверка:</strong> Тариф × База ={" "}
                                    {calculatedTariff.toFixed(4)} ×{" "}
                                    {getBaseValueDisplay()} ={" "}
                                    {validationResult.calculatedTotal.toFixed(
                                        2
                                    )}{" "}
                                    руб
                                </Typography>
                                {validationResult.isExact ? (
                                    <Alert severity="success" sx={{ mt: 1 }}>
                                        Тариф полностью покрывает затраты (
                                        {validationResult.originalTotal.toFixed(
                                            2
                                        )}{" "}
                                        руб)
                                    </Alert>
                                ) : (
                                    <Alert severity="warning" sx={{ mt: 1 }}>
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
                                    </Alert>
                                )}
                            </>
                        ) : (
                            // С рассрочкой
                            <>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Рассчитанный тариф в месяц:</strong>{" "}
                                    {calculatedTariff.toFixed(4)}{" "}
                                    {getUnitLabel()}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Дата начала:</strong> {startDate}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Дата окончания:</strong>{" "}
                                    {calculateEndDate()}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Общий тариф без рассрочки:</strong>{" "}
                                    {validationResult.baseTariff.toFixed(4)}{" "}
                                    {getUnitLabel()}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Порядок расчета:</strong> (Общая
                                    стоимость / {getBaseLabel()}) /{" "}
                                    {validationResult.months} месяцев = (
                                    {totalCost} / {getBaseValueDisplay()}) /{" "}
                                    {validationResult.months} ={" "}
                                    {calculatedTariff.toFixed(4)}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Проверка:</strong> Тариф × База ×{" "}
                                    {validationResult.months} месяцев ={" "}
                                    {calculatedTariff.toFixed(4)} ×{" "}
                                    {getBaseValueDisplay()} ×{" "}
                                    {validationResult.months} ={" "}
                                    {validationResult.totalCalculated.toFixed(
                                        2
                                    )}{" "}
                                    руб
                                </Typography>
                                {validationResult.isExact ? (
                                    <Alert severity="success" sx={{ mt: 1 }}>
                                        Тариф полностью покрывает затраты (
                                        {validationResult.originalTotal.toFixed(
                                            2
                                        )}{" "}
                                        руб)
                                    </Alert>
                                ) : (
                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                        Обратный расчёт даёт{" "}
                                        {validationResult.totalCalculated.toFixed(
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
                                    </Alert>
                                )}
                            </>
                        )}
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
