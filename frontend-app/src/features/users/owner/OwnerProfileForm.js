import React from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Paper,
} from "@mui/material";
import {
    Person as PersonIcon,
    Home as HomeIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Telegram as TelegramIcon,
    Apartment as ApartmentIcon,
    SquareFoot as AreaIcon,
    MeetingRoom as RoomsIcon,
    Elevator as EntranceIcon,
    Stairs as StairsIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";

const OwnerProfileForm = ({ ownerData, email, onDeleteAccount }) => {
    // Форматируем дату регистрации
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Получаем инициалы для аватара
    const getInitials = () => {
        return `${ownerData.last_name[0]}${ownerData.first_name[0]}`;
    };

    return (
        <Box sx={{ mx: "auto", mt: 4 }}>
            {/* Информация о собственнике */}
            <Grid
                container
                spacing={3}
                direction={{ xs: "column", md: "row" }}
                sx={{ alignItems: "stretch" }}
            >
                {/* Аватар и ФИО */}
                <Card
                    elevation={3}
                    sx={{
                        mb: 3,
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                    }}
                >
                    <CardContent
                        sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Grid
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                flexGrow: 1,
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    fontSize: 48,
                                    bgcolor: "primary.main",
                                    mb: 2,
                                }}
                            >
                                {getInitials()}
                            </Avatar>

                            <Typography
                                variant="h5"
                                align="center"
                                sx={{ fontWeight: "bold" }}
                            >
                                {ownerData.last_name} {ownerData.first_name}{" "}
                                {ownerData.patronymic}
                            </Typography>

                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                                align="center"
                            >
                                Собственник
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ mt: 1 }}
                            >
                                Регистрация:{" "}
                                {formatDate(ownerData.ownership_start_date)}
                            </Typography>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Контактная информация */}
                <Card
                    elevation={3}
                    sx={{
                        mb: 3,
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                    }}
                >
                    <CardContent
                        sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Grid
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                flexGrow: 1,
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                <PersonIcon sx={{ mr: 1 }} /> Контактные данные
                            </Typography>

                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <EmailIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Email"
                                        secondary={email}
                                        secondaryTypographyProps={{
                                            sx: {
                                                fontWeight: "medium",
                                            },
                                        }}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <PhoneIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Телефон"
                                        secondary={
                                            ownerData.phone || "Не указан"
                                        }
                                        secondaryTypographyProps={{
                                            sx: {
                                                fontWeight: "medium",
                                            },
                                        }}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <TelegramIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Telegram"
                                        secondary={
                                            ownerData.telegram || "Не указан"
                                        }
                                        secondaryTypographyProps={{
                                            sx: {
                                                fontWeight: "medium",
                                            },
                                        }}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* Информация о квартире */}
            <Card elevation={3} sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <HomeIcon sx={{ mr: 1 }} /> Информация о собственности
                    </Typography>

                    <Grid
                        container
                        spacing={2}
                        sx={{ justifyContent: "center" }}
                    >
                        {/* Квартира */}
                        <Grid
                            size={{ xs: 12, sm: 4, md: 2.4 }}
                            sx={{ display: "flex" }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: "background.default",
                                    borderRadius: 2,
                                    flexGrow: 1,
                                    minWidth: 0,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1,
                                    }}
                                >
                                    <ApartmentIcon
                                        color="secondary"
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="subtitle1">
                                        Квартира
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    № {ownerData.apartment?.number}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Площадь */}
                        <Grid
                            size={{ xs: 12, sm: 4, md: 2.4 }}
                            sx={{ display: "flex" }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: "background.default",
                                    borderRadius: 2,
                                    flexGrow: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1,
                                    }}
                                >
                                    <AreaIcon
                                        color="secondary"
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="subtitle1">
                                        Площадь
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    {ownerData.apartment?.area} м²
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Комнаты */}
                        <Grid
                            size={{ xs: 12, sm: 4, md: 2.4 }}
                            sx={{ display: "flex" }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: "background.default",
                                    borderRadius: 2,
                                    flexGrow: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1,
                                    }}
                                >
                                    <RoomsIcon
                                        color="secondary"
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="subtitle1">
                                        Комнаты
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    {ownerData.apartment?.rooms}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Подъезд */}
                        <Grid
                            size={{ xs: 12, sm: 4, md: 2.4 }}
                            sx={{ display: "flex" }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: "background.default",
                                    borderRadius: 2,
                                    flexGrow: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1,
                                    }}
                                >
                                    <EntranceIcon
                                        color="secondary"
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="subtitle1">
                                        Подъезд
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    {ownerData.apartment?.entrance}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Этаж */}
                        <Grid
                            size={{ xs: 12, sm: 4, md: 2.4 }}
                            sx={{ display: "flex" }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: "background.default",
                                    borderRadius: 2,
                                    flexGrow: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 1,
                                    }}
                                >
                                    <StairsIcon
                                        color="secondary"
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="subtitle1">
                                        Этаж
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    {ownerData.apartment?.floor}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Кнопка удаления */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={onDeleteAccount}
                    sx={{
                        py: 1.5,
                        px: 4,
                        fontWeight: "bold",
                        "&:hover": {
                            bgcolor: "error.light",
                            color: "error.contrastText",
                        },
                    }}
                >
                    Удалить аккаунт
                </Button>
            </Box>
        </Box>
    );
};

export default OwnerProfileForm;
