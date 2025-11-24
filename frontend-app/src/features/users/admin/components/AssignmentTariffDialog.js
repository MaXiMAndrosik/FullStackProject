import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";
import { format } from "date-fns";
import AssignmentTariffCalculatorDialog from "./AssignmentTariffCalculatorDialog";

const AssignmentTariffDialog = ({
    open,
    onClose,
    currentTariff,
    onSubmit,
    services,
    apartments,
    entrances,
    loading,
}) => {
    const [openCalculator, setOpenCalculator] = useState(false);
    const [rateValue, setRateValue] = useState("");
    const [startDateValue, setStartDateValue] = useState("");
    const [endDateValue, setEndDateValue] = useState("");

    // Находим связанную услугу по assignment_id
    const serviceAssignment = currentTariff
        ? services.find((s) => s.id === currentTariff.assignment_id) // Используем assignment_id
        : null;

    // Определяем, можно ли рассчитать тариф
    const canCalculate = serviceAssignment?.calculation_type !== "fixed";

    // Обработчик применения рассчитанного тарифа
    const handleApplyCalculatedTariff = (result) => {
        if (typeof result === "object") {
            // Это объект с рассрочкой - заполняем все поля
            setRateValue(result.rate.toString());
            if (result.start_date) {
                setStartDateValue(result.start_date);
            }
            if (result.end_date) {
                setEndDateValue(result.end_date);
            }
        } else {
            // Это просто число (без рассрочки) - заполняем только rate
            setRateValue(result.toString());
        }
        setOpenCalculator(false);
    };

    // Сбрасываем состояние при открытии нового диалога
    useEffect(() => {
        if (open) {
            if (currentTariff?.rate) {
                setRateValue(parseFloat(currentTariff.rate).toFixed(4));
            } else {
                setRateValue("");
            }

            if (currentTariff?.start_date) {
                setStartDateValue(
                    format(new Date(currentTariff.start_date), "yyyy-MM-dd")
                );
            } else {
                setStartDateValue(format(new Date(), "yyyy-MM-dd"));
            }

            if (currentTariff?.end_date) {
                setEndDateValue(
                    format(new Date(currentTariff.end_date), "yyyy-MM-dd")
                );
            } else {
                setEndDateValue("");
            }
        }
    }, [open, currentTariff]);

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    {currentTariff
                        ? "Редактирование тарифа"
                        : "Добавление нового тарифа"}
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={onSubmit} id="tariff-form">
                        <Box sx={{ mt: 1, mb: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Услуга:</strong>{" "}
                                {serviceAssignment?.name}
                            </Typography>

                            <Typography variant="subtitle1" gutterBottom>
                                {serviceAssignment?.scope === "apartment"
                                    ? `Квартира ${serviceAssignment?.apartment_id}`
                                    : `Подъезд ${serviceAssignment?.entrance}`}
                            </Typography>
                        </Box>

                        <StyledTextArea
                            name="rate"
                            label="Тариф"
                            type="number"
                            value={rateValue}
                            onChange={(e) => setRateValue(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                            inputProps={{
                                step: "0.0001",
                                min: "0",
                                max: "9999.9999",
                            }}
                        />
                        <StyledTextArea
                            name="start_date"
                            label="Дата начала"
                            type="date"
                            value={startDateValue}
                            onChange={(e) => setStartDateValue(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <StyledTextArea
                            name="end_date"
                            label="Дата окончания (необязательно)"
                            type="date"
                            value={endDateValue}
                            onChange={(e) => setEndDateValue(e.target.value)}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                    </form>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "space-between" }}>
                    <Box>
                        {canCalculate && (
                            <Button
                                variant="contained"
                                onClick={() => setOpenCalculator(true)}
                                disabled={loading}
                            >
                                Рассчитать тариф
                            </Button>
                        )}
                    </Box>
                    <Box>
                        <Button
                            onClick={onClose}
                            sx={{ mr: 1 }}
                            disabled={loading}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            form="tariff-form"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? "Сохранение..." : "Сохранить"}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Диалог расчета тарифа - передаем текущую дату начала */}
            {serviceAssignment && (
                <AssignmentTariffCalculatorDialog
                    open={openCalculator}
                    onClose={() => setOpenCalculator(false)}
                    serviceAssignment={serviceAssignment}
                    apartments={apartments}
                    entrances={entrances}
                    onSubmit={handleApplyCalculatedTariff}
                    initialStartDate={startDateValue}
                />
            )}
        </>
    );
};

export default AssignmentTariffDialog;
