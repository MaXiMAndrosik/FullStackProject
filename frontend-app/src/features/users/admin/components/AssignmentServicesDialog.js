import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Box,
    Typography,
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";

const AssignmentDialog = ({
    open,
    onClose,
    currentAssignment,
    onSubmit,
    apartments,
    entrances,
    assignmentScope,
    setAssignmentScope,
    selectedEntrances,
    setSelectedEntrances,
    selectedApartments,
    setSelectedApartments,
    calculationType,
    setCalculationType,
}) => {
    const handleEntrancesChange = (event) => {
        setSelectedEntrances(event.target.value.map(Number));
    };

    const handleApartmentsChange = (event) => {
        setSelectedApartments(event.target.value.map(Number));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {currentAssignment
                    ? "Редактирование услуги"
                    : "Добавление новой услуги"}
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit} id="assignment-form">
                    {/* Название услуги */}
                    <StyledTextArea
                        name="name"
                        label="Название"
                        defaultValue={currentAssignment?.name || ""}
                        fullWidth
                        margin="normal"
                        required
                    />
                    {/* Тип услуги */}
                    <StyledTextArea
                        name="type"
                        label="Тип услуги"
                        select
                        defaultValue={currentAssignment?.type || "main"}
                        fullWidth
                        margin="normal"
                        required
                    >
                        <MenuItem value="main">Основная</MenuItem>
                        <MenuItem value="utility">Коммунальная</MenuItem>
                        <MenuItem value="additional">Дополнительная</MenuItem>
                        <MenuItem value="other">Прочее</MenuItem>
                    </StyledTextArea>

                    {/* Тип привязки - только для создания */}
                    {!currentAssignment && (
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Тип привязки</InputLabel>
                            <Select
                                name="scope"
                                defaultValue="apartment"
                                label="Тип привязки"
                                required
                                onChange={(e) => {
                                    setAssignmentScope(e.target.value);
                                    if (e.target.value === "entrance") {
                                        setSelectedApartments([]);
                                    } else {
                                        setSelectedEntrances([]);
                                    }
                                }}
                            >
                                <MenuItem value="apartment">
                                    К отдельным квартирам
                                </MenuItem>
                                <MenuItem value="entrance">
                                    К подъездам
                                </MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {/* Выбор объектов - только для создания */}
                    {!currentAssignment && assignmentScope === "entrance" && (
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Подъезды</InputLabel>
                            <Select
                                multiple
                                value={selectedEntrances}
                                onChange={handleEntrancesChange}
                                label="Подъезды"
                                renderValue={(selected) => selected.join(", ")}
                            >
                                {entrances.map((num) => (
                                    <MenuItem key={num} value={num}>
                                        <Checkbox
                                            checked={selectedEntrances.includes(
                                                num
                                            )}
                                        />
                                        <ListItemText
                                            primary={`Подъезд ${num}`}
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {!currentAssignment && assignmentScope === "apartment" && (
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Квартиры</InputLabel>
                            <Select
                                multiple
                                value={selectedApartments}
                                onChange={handleApartmentsChange}
                                label="Квартиры"
                                renderValue={(selected) => {
                                    const selectedApts = apartments.filter(
                                        (a) => selected.includes(a.id)
                                    );
                                    return selectedApts
                                        .map((a) => a.number)
                                        .join(", ");
                                }}
                            >
                                {apartments.map((apartment) => (
                                    <MenuItem
                                        key={apartment.id}
                                        value={apartment.id}
                                    >
                                        <Checkbox
                                            checked={selectedApartments.includes(
                                                apartment.id
                                            )}
                                        />
                                        <ListItemText
                                            primary={`Кв. ${apartment.number}`}
                                            secondary={`Подъезд ${apartment.entrance}`}
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* Показываем текущую привязку при редактировании */}
                    {currentAssignment && (
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                border: "1px solid #ccc",
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="subtitle1">
                                Текущая привязка:
                            </Typography>
                            {currentAssignment.scope === "entrance" ? (
                                <Typography>
                                    Подъезд {currentAssignment.entrance}
                                </Typography>
                            ) : (
                                <Typography>
                                    Квартира{" "}
                                    {
                                        apartments.find(
                                            (a) =>
                                                a.id ===
                                                currentAssignment.apartment_id
                                        )?.number
                                    }
                                </Typography>
                            )}
                            <Typography variant="body2" color="textSecondary">
                                Привязка не может быть изменена после создания
                            </Typography>
                        </Box>
                    )}

                    <StyledTextArea
                        name="calculation_type"
                        label="Тип расчёта"
                        select
                        SelectProps={{ native: true }}
                        defaultValue={
                            currentAssignment?.calculation_type || "fixed"
                        }
                        fullWidth
                        margin="normal"
                        onChange={(e) => setCalculationType(e.target.value)}
                        required
                    >
                        <option value="fixed">Фиксированный</option>
                        <option value="meter">По счётчику</option>
                        <option value="area">По площади</option>
                    </StyledTextArea>

                    {calculationType === "meter" && (
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Единица измерения</InputLabel>
                            <Select
                                name="unit"
                                defaultValue={
                                    currentAssignment?.tariffs?.[0]?.unit ||
                                    "m3"
                                }
                                label="Единица измерения"
                                required
                            >
                                <MenuItem value="m3">
                                    м³ (кубический метр)
                                </MenuItem>
                                <MenuItem value="gcal">
                                    Гкал (гигакалория)
                                </MenuItem>
                                <MenuItem value="kwh">
                                    кВт·ч (киловатт-час)
                                </MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            defaultChecked={
                                currentAssignment?.is_active ?? true
                            }
                        />
                        <label htmlFor="is_active" style={{ marginLeft: 8 }}>
                            Активна
                        </label>
                    </Box>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button
                    type="submit"
                    form="assignment-form"
                    variant="contained"
                >
                    {currentAssignment ? "Сохранить" : "Создать"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignmentDialog;
