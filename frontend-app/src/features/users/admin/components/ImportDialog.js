import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    LinearProgress,
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";
import { CloudUpload, Description } from "@mui/icons-material";

const ImportDialog = ({
    open,
    onClose,
    onFileChange,
    onImport,
    file,
    progress,
    importing,
    importStep,
    importResults,
    onSaveErrorReport,
    handleTemplate,
    title,
}) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            {/* Шаг 1: Выбор файла */}
            {importStep === "select" && (
                <>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        <Box
                            sx={{
                                mt: 2,
                                mb: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <input
                                accept=".xlsx,.xls"
                                style={{ display: "none" }}
                                id="import-file"
                                type="file"
                                onChange={onFileChange}
                                disabled={importing}
                            />
                            <label htmlFor="import-file">
                                <Button
                                    variant="contained"
                                    component="span"
                                    startIcon={<CloudUpload />}
                                    disabled={importing}
                                    title="Выберите файл Excel для импорта"
                                >
                                    Выберите файл
                                </Button>
                            </label>
                            {!file && (
                                <Button
                                    variant="outlined"
                                    onClick={handleTemplate}
                                    startIcon={<Description />}
                                    sx={{ mr: 2 }}
                                >
                                    Скачать шаблон
                                </Button>
                            )}
                            {file && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        p: 1.5,
                                        borderRadius: 1,
                                        bgcolor: "action.hover",
                                        border: "1px solid",
                                        borderColor: "divider",
                                    }}
                                >
                                    <Description color="primary" />
                                    <Typography
                                        variant="body1"
                                        sx={{ flexGrow: 1 }}
                                    >
                                        {file.name}
                                    </Typography>
                                </Box>
                            )}
                            <Typography
                                variant="caption"
                                sx={{
                                    display: "block",
                                    mt: 1,
                                    color: "text.secondary",
                                }}
                            >
                                Поддерживаемые форматы: .xlsx, .xls (макс. 5MB)
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} disabled={importing}>
                            Отмена
                        </Button>
                        <Button
                            onClick={onImport}
                            variant="contained"
                            color="primary"
                            disabled={!file || importing}
                        >
                            Импортировать
                        </Button>
                    </DialogActions>
                </>
            )}

            {/* Шаг 2: Прогресс импорта */}
            {importStep === "progress" && (
                <>
                    <DialogTitle>Идет импорт данных...</DialogTitle>
                    <DialogContent>
                        <Box sx={{ width: "100%", mt: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                            />
                            <Typography
                                variant="body2"
                                sx={{ mt: 1, textAlign: "center" }}
                            >
                                {progress}% завершено
                            </Typography>
                        </Box>
                    </DialogContent>
                </>
            )}

            {/* Шаг 3: Результаты импорта */}
            {importStep === "results" && (
                <>
                    <DialogTitle>Результаты импорта</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Успешно импортировано: {importResults.successCount},
                            с ошибками: {importResults.errorCount}
                        </Typography>

                        {importResults.errorCount > 0 && (
                            <>
                                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                                    Первые 5 ошибок:
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Ошибка</TableCell>
                                                <TableCell>Запись</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {importResults.errors
                                                .slice(0, 5)
                                                .map((error, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            {error.error}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box
                                                                sx={{
                                                                    maxHeight: 100,
                                                                    overflowY:
                                                                        "auto",
                                                                    fontFamily:
                                                                        "monospace",
                                                                    fontSize:
                                                                        "0.75rem",
                                                                }}
                                                            >
                                                                {JSON.stringify(
                                                                    error.record,
                                                                    null,
                                                                    2
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Box
                                    sx={{
                                        mt: 2,
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={onSaveErrorReport}
                                        startIcon={<Description />}
                                    >
                                        Скачать полный отчет об ошибках
                                    </Button>
                                </Box>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} variant="contained">
                            Закрыть
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default ImportDialog;
