import { useState } from "react";
import {
    Stack,
    Box,
    Button,
    Divider,
    FormLabel,
    FormControl,
    Link,
    TextField,
    Typography,
    CssBaseline,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { Logo } from "../../shared/ui/Logo";
import { useDispatch } from "react-redux";
import { registerUser } from "../auth/model/authSlice";
import { useNavigate } from "react-router-dom";
import Content from "./components/Content";
import AuthSideContent from "./components/AuthSideContent";

const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: theme.spacing(2, 0),
    overflow: "visible",
    boxShadow:
        "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
    [theme.breakpoints.up("sm")]: {
        width: "450px",
    },
    ...theme.applyStyles("dark", {
        boxShadow:
            "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
    }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
    minHeight: "100vh",
    overflowY: "auto",
    position: "relative",
    padding: theme.spacing(2),
    gap: theme.spacing(12),
    [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(4),
    },
    "&::before": {
        content: '""',
        display: "block",
        position: "fixed",
        zIndex: -1,
        inset: 0,
        backgroundImage:
            "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
        backgroundRepeat: "no-repeat",
        ...theme.applyStyles("dark", {
            backgroundImage:
                "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
        }),
    },
}));

export default function SignUp(props) {
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [nameError, setNameError] = useState(false);
    const [nameErrorMessage, setNameErrorMessage] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validateInputs = () => {
        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const password = document.getElementById("password");
        const passwordConfirmation = document.getElementById(
            "password_confirmation"
        );

        let isValid = true;

        if (!name.value || name.value.length < 1) {
            setNameError(true);
            setNameErrorMessage("Введите Ваше имя.");
            isValid = false;
        } else {
            setNameError(false);
            setNameErrorMessage("");
        }

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage(
                "Пожалуйста, введите действительный адрес электронной почты."
            );
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage("");
        }

        if (password.value !== passwordConfirmation.value) {
            setPasswordError(true);
            setPasswordErrorMessage("Пароли не совпадают.");
            isValid = false;
        } else if (password.value.length < 8) {
            setPasswordError(true);
            setPasswordErrorMessage(
                "Пароль должен быть длиной не менее 8 символов."
            );
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage("");
        }

        return isValid;
    };
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateInputs()) {
            return;
        }

        const userData = {
            name: event.currentTarget.name.value,
            email: event.currentTarget.email.value,
            password: event.currentTarget.password.value,
            password_confirmation:
                event.currentTarget.password_confirmation.value,
        };

        try {
            const result = await dispatch(registerUser(userData));

            if (registerUser.fulfilled.match(result)) {
                // Перенаправляем на страницу подтверждения
                navigate("/verify-notice", {
                    state: { email: userData.email },
                });
            }

            if (registerUser.rejected.match(result)) {
                // Обработка ошибки: Этот email уже занят
                if (result.payload?.errors?.email?.[0]) {
                    setEmailError(true);
                    setEmailErrorMessage(
                        "Этот email уже занят. Попробуйте войти или восстановить пароль."
                    );
                }

                // Обработка иных ошибок валидации с сервера
                if (result.payload?.errors) {
                    console.log(result.payload);
                }
            }
        } catch (err) {
            console.error("Ошибка регистрации:", err);
        }
    };

    return (
        <>
            <CssBaseline enableColorScheme />
            <SignUpContainer
                direction={{ xs: "column", md: "row" }}
                justifyContent={{ xs: "flex-start", md: "center" }}
                alignItems={{ xs: "stretch", md: "center" }}
                sx={{
                    "& > :first-of-type": { order: { xs: 2, md: 1 } },
                    "& > :last-of-type": {
                        order: { xs: 1, md: 2 },
                        my: { xs: 2, md: 0 },
                    },
                }}
            >
                <AuthSideContent />
                {/* <Content /> */}
                <Card variant="outlined">
                    <Logo />
                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{
                            width: "100%",
                            fontSize: "clamp(1.2rem, 3vw + 0.8rem, 2rem)",
                        }}
                    >
                        Зарегистрироваться
                    </Typography>
                    {/* Поля для ввода данных пользователя */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        {/* Поле для ввода имени и фамилии пользователя */}
                        <FormControl>
                            <FormLabel htmlFor="name">Имя и фамилия</FormLabel>
                            <TextField
                                autoComplete="name"
                                name="name"
                                required
                                fullWidth
                                id="name"
                                placeholder="Jon Snow"
                                error={nameError}
                                helperText={nameErrorMessage}
                                color={nameError ? "error" : "primary"}
                            />
                        </FormControl>
                        {/* Поле для ввода электронной почты */}
                        <FormControl>
                            <FormLabel htmlFor="email">
                                Адрес электронной почты
                            </FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                placeholder="your@email.com"
                                name="email"
                                autoComplete="email"
                                variant="outlined"
                                error={emailError}
                                helperText={emailErrorMessage}
                                color={passwordError ? "error" : "primary"}
                            />
                        </FormControl>
                        {/* Поле для ввода пароля */}
                        <FormControl>
                            <FormLabel htmlFor="password">Пароль</FormLabel>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                placeholder="••••••"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                variant="outlined"
                                error={passwordError}
                                helperText={passwordErrorMessage}
                                color={passwordError ? "error" : "primary"}
                            />
                        </FormControl>
                        {/* Поле для повторного ввода пароля */}
                        <FormControl>
                            <FormLabel htmlFor="password_confirmation">
                                Подтвердите пароль
                            </FormLabel>
                            <TextField
                                required
                                fullWidth
                                name="password_confirmation"
                                placeholder="••••••"
                                type="password"
                                id="password_confirmation"
                                autoComplete="new-password"
                                variant="outlined"
                                error={passwordError}
                                helperText={passwordErrorMessage}
                                color={passwordError ? "error" : "primary"}
                            />
                        </FormControl>
                        {/* Кнопка зарегестрироваться */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            onClick={validateInputs}
                        >
                            Зарегистрироваться
                        </Button>
                    </Box>
                    <Divider>
                        <Typography sx={{ color: "text.secondary" }}>
                            или
                        </Typography>
                    </Divider>
                    {/* Или войти */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <Typography sx={{ textAlign: "center" }}>
                            У вас уже есть аккаунт?{" "}
                            <Link
                                href="/login"
                                variant="body2"
                                sx={{ alignSelf: "center" }}
                            >
                                Войти
                            </Link>
                        </Typography>
                    </Box>
                </Card>
            </SignUpContainer>
        </>
    );
}
