import { useState, useRef } from "react";
import {
    Box,
    Button,
    Stack,
    Typography,
    IconButton,
    FormControl,
    Select,
    MenuItem,
    TextField,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { Delete, LocationOn, Schedule, AttachFile } from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { ArrayTextField } from "../ui/ArrayTextField";
import { AnnouncementMetaFields } from "../ui/AnnouncementMetaFields";

export default function MeetingAnnouncement({
    form,
    onChange,
    onArrayChange,
    onAddToArray,
    onRemoveFromArray,
    onSubmit,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const [currentDate] = useState(new Date());

    const handleDateChange = (newValue, field) => {
        onChange(field, newValue.toISOString());
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newDocuments = files.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
            file,
        }));
        onAddToArray("documents", ...newDocuments);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        onSubmit(form);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
                {/* Вид собрания */}
                <FormControl fullWidth sx={{ pb: 1 }}>
                    <Typography
                        variant="body2"
                        sx={{ color: "primary.main", mb: 0.5 }}
                    >
                        Вид собрания
                    </Typography>
                    <Select
                        value={form.title || ""}
                        onChange={(e) => onChange("title", e.target.value)}
                        required
                    >
                        <MenuItem value="Общее собрание членов ЖСПК">
                            Общее собрание членов ЖСПК
                        </MenuItem>
                        <MenuItem value="Общее собрание членов ЖСПК">
                            Письменное общее собрание членов ЖСПК
                        </MenuItem>
                        <MenuItem value="Собрание уполномоченных членов ЖСПК">
                            Собрание уполномоченных членов ЖСПК
                        </MenuItem>
                        <MenuItem value="Внеочередное общее собрание членов ЖСПК">
                            Внеочередное общее собрание членов ЖСПК
                        </MenuItem>
                        <MenuItem value="Внеочередное собрание уполномоченных членов ЖСПК">
                            Внеочередное собрание уполномоченных членов ЖСПК
                        </MenuItem>
                    </Select>
                </FormControl>

                {/* Дата, время, место проведения и тип собрания */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 2,
                        alignItems: { md: "flex-end" },
                        mb: 2,
                        "& > div": {
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            "& .MuiFormControl-root": {
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                            },
                            "& .MuiTextField-root, & .MuiInputBase-root": {
                                height: "56px",
                            },
                        },
                    }}
                >
                    {/* Дата и время */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{ color: "primary.main", mb: 0.5 }}
                        >
                            Дата и время проведения *
                        </Typography>
                        <DateTimePicker
                            value={form.date ? new Date(form.date) : null}
                            onChange={(newValue) =>
                                handleDateChange(newValue, "date")
                            }
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                },
                            }}
                            minDate={new Date()}
                        />
                    </Box>

                    {/* Место проведения */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{ color: "primary.main", mb: 0.5 }}
                        >
                            Место проведения *
                        </Typography>
                        <TextField
                            fullWidth
                            value={form.location || ""}
                            onChange={(e) =>
                                onChange("location", e.target.value)
                            }
                            InputProps={{
                                startAdornment: (
                                    <LocationOn
                                        sx={{ mr: 1, color: "action.active" }}
                                    />
                                ),
                            }}
                            required
                        />
                    </Box>

                    {/* Тип собрания */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{ color: "primary.main", mb: 0.5 }}
                        >
                            Тип собрания *
                        </Typography>
                        <FormControl fullWidth>
                            <Select
                                value={form.necessity || ""}
                                onChange={(e) =>
                                    onChange("necessity", e.target.value)
                                }
                                required
                            >
                                <MenuItem value="Обязательно для всех членов ЖСПК">
                                    Обязательно для всех членов ЖСПК
                                </MenuItem>
                                <MenuItem value="Отчетное собрание">
                                    Отчетное собрание
                                </MenuItem>
                                <MenuItem value="Отчетно-выборное собрание">
                                    Отчетно-выборное собрание
                                </MenuItem>
                                <MenuItem value="Информационное собрание">
                                    Информационное собрание
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {/* Текст объявления (абзацы) */}
                <ArrayTextField
                    fieldName="message"
                    form={form}
                    onArrayChange={onArrayChange}
                    onAddToArray={onAddToArray}
                    onRemoveFromArray={onRemoveFromArray}
                    label="Текст объявления"
                    addButtonText="Добавить абзац"
                    rows={4}
                />

                {/* Повестка собрания */}
                <ArrayTextField
                    fieldName="agenda"
                    form={form}
                    onArrayChange={onArrayChange}
                    onAddToArray={onAddToArray}
                    onRemoveFromArray={onRemoveFromArray}
                    label="Пункт повестки"
                    addButtonText="Добавить пункт"
                    rows={2}
                />

                {/* Прикрепленные документы */}
                <Box>
                    <Typography
                        variant="body2"
                        sx={{ color: "primary.main", mb: 1 }}
                    >
                        Прикрепленные документы
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<AttachFile />}
                            onClick={() => fileInputRef.current.click()}
                            sx={{ flexShrink: 0 }}
                        >
                            Добавить документ
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                        />
                    </Box>
                    {form.documents?.length > 0 ? (
                        <List
                            dense
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                p: 1,
                            }}
                        >
                            {form.documents.map((doc, index) => (
                                <ListItem
                                    key={index}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() =>
                                                onRemoveFromArray(
                                                    "documents",
                                                    index
                                                )
                                            }
                                            color="error"
                                            size="small"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    }
                                    sx={{ py: 1 }}
                                >
                                    <ListItemText primary={doc.name} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                fontStyle: "italic",
                                p: 2,
                                textAlign: "center",
                                border: "1px dashed",
                                borderColor: "divider",
                                borderRadius: 1,
                            }}
                        >
                            Нет прикрепленных документов
                        </Typography>
                    )}
                </Box>

                {/* Общие компоненты: Подпись, Контакты, Дата Публикации, Дата удаления объявления */}
                <AnnouncementMetaFields
                    form={form}
                    onChange={onChange}
                    currentDate={currentDate}
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={<Schedule />}
                    sx={{ alignSelf: "flex-start" }}
                >
                    {isSubmitting ? "Создание..." : "Создать объявление"}
                </Button>
            </Stack>
        </Box>
    );
}
