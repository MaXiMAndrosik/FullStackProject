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
import TariffCalculatorDialog from "./TariffCalculatorDialog";

const TariffDialog = ({
    open,
    onClose,
    currentTariff,
    onSubmit,
    services,
    apartments,
}) => {
    const [rateValue, setRateValue] = useState(currentTariff?.rate || "");
    const [openCalculator, setOpenCalculator] = useState(false);

    // Находим объект услуги по ID
    const service =
        services.find((s) => s.id === currentTariff?.service_id) || null;

    // Определяем, можно ли рассчитать тариф
    const canCalculate = service?.calculation_type !== "fixed";

    // Обновляем состояния при изменении currentTariff
    useEffect(() => {
        setRateValue(currentTariff?.rate || "");
    }, [currentTariff]);

    // // Обработчик отправки формы
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     const formData = new FormData(e.target);
    //     const data = Object.fromEntries(formData.entries());

    //     // Используем актуальные значения из состояния
    //     data.rate = rateValue;
    //     // data.service_id = selectedService;

    //     // Преобразование пустых строк в null
    //     if (data.end_date === "") data.end_date = null;

    //     onSubmit(data);
    // };

    // Обработчик применения рассчитанного тарифа
    const handleApplyCalculatedTariff = (rate) => {
        setRateValue(rate);
        setOpenCalculator(false);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>Редактирование тарифа</DialogTitle>
                <DialogContent>
                    <form onSubmit={onSubmit} id="tariff-form">
                        <Box sx={{ mt: 1, mb: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Услуга:</strong> {service?.name}
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
                            value={
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
                            value={
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
            {canCalculate && (
                <TariffCalculatorDialog
                    open={openCalculator}
                    onClose={() => setOpenCalculator(false)}
                    service={service}
                    apartments={apartments}
                    onSubmit={handleApplyCalculatedTariff}
                />
            )}
        </>
    );
};

export default TariffDialog;
