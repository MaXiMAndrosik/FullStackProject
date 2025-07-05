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
import StyledTextArea from "../../../../../shared/ui/StyledTextArea";
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
}) => {
    const [openCalculator, setOpenCalculator] = useState(false);
    const [rateValue, setRateValue] = useState(currentTariff?.rate || "");
    
    // Находим связанную услугу
    const serviceAssignment = currentTariff
        ? services.find((s) => s.id === currentTariff.assignment_id)
        : null;

    // Определяем, можно ли рассчитать тариф
    const canCalculate = serviceAssignment?.calculation_type !== "fixed";

    // Обработчик применения рассчитанного тарифа
    const handleApplyCalculatedTariff = (rate) => {
        setRateValue(rate);
        setOpenCalculator(false);
    };

    // Сбрасываем состояние при открытии нового диалога
    useEffect(() => {
        if (open) {
            setRateValue(currentTariff?.rate || "");
        }
    }, [open, currentTariff]);

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>Редактирование тарифа</DialogTitle>
                <DialogContent>
                    <form onSubmit={onSubmit} id="tariff-form">
                        <Box sx={{ mt: 1, mb: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Услуга:</strong>{" "}
                                {serviceAssignment?.name}
                            </Typography>

                            <Typography variant="subtitle1" gutterBottom>
                                {serviceAssignment?.scope === "apartment"
                                    ? services.apartment_info ||
                                      `Квартира ${serviceAssignment?.apartment_id}`
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
                            inputProps={{ step: "0.0001", min: "0" }}
                        />
                        <StyledTextArea
                            name="start_date"
                            label="Дата начала"
                            type="date"
                            defaultValue={
                                currentTariff?.start_date
                                    ? format(
                                          new Date(currentTariff.start_date),
                                          "yyyy-MM-dd"
                                      )
                                    : format(new Date(), "yyyy-MM-dd")
                            }
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <StyledTextArea
                            name="end_date"
                            label="Дата окончания (необязательно)"
                            type="date"
                            defaultValue={
                                currentTariff?.end_date
                                    ? format(
                                          new Date(currentTariff.end_date),
                                          "yyyy-MM-dd"
                                      )
                                    : ""
                            }
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
                                type="submit"
                                variant="contained"
                                onClick={() => setOpenCalculator(true)}
                            >
                                Рассчитать тариф
                            </Button>
                        )}
                    </Box>
                    <Box>
                        <Button onClick={onClose} sx={{ mr: 1 }}>
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            form="tariff-form"
                            variant="contained"
                        >
                            Сохранить
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Диалог расчета тарифа */}
            {serviceAssignment && (
                <AssignmentTariffCalculatorDialog
                    open={openCalculator}
                    onClose={() => setOpenCalculator(false)}
                    serviceAssignment={serviceAssignment}
                    apartments={apartments}
                    entrances={entrances}
                    onSubmit={handleApplyCalculatedTariff}
                />
            )}
        </>
    );
};

export default AssignmentTariffDialog;
