import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import ForgotPassword from "./ForgotPassword";
import { Logo } from "../../../shared/ui/Logo";
import { useDispatch, useSelector } from "react-redux";
import {
    loginUser,
    selectIsAuthenticated,
    selectCurrentUser,
} from "../model/authSlice";
import { useNavigate } from "react-router-dom";

const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
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

export default function SignInCard() {
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [open, setOpen] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [rememberMe, setRememberMe] = useState(false);
    // Селекторы из Redux
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleRememberMeChange = (event) => {
        setRememberMe(event.target.checked);
    };

    const validateInputs = () => {
        const email = document.getElementById("email");
        const password = document.getElementById("password");

        let isValid = true;

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

        if (!password.value || password.value.length < 6) {
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
            email: event.currentTarget.email.value,
            password: event.currentTarget.password.value,
            remember: rememberMe,
        };
        console.log(userData);

        try {
            const result = await dispatch(loginUser(userData));

            if (loginUser.fulfilled.match(result)) {
                navigate("/");
                return;
            }

            if (loginUser.rejected.match(result)) {
                // "Неверный email или пароль (401)
                if (
                    result.payload?.status === 401 ||
                    result.payload?.message?.includes("Invalid credentials")
                ) {
                    setEmailError(true);
                    setEmailErrorMessage("Неверный email или пароль.");
                    setPasswordError(true);
                    setPasswordErrorMessage("Неверный email или пароль.");
                    return;
                }

                // "Неверный email или пароль (429)
                if (
                    result.payload?.status === 429 ||
                    result.payload?.message?.includes("Too Many Attempts")
                ) {
                    setEmailError(true);
                    setEmailErrorMessage("Слишком много запросов.");
                    return;
                }

                console.log("HTTP Status Code:", result.payload?.status);
                console.log("Full error payload:", result.payload);

                // Обработка иных ошибок валидации с сервера
                if (result.payload?.errors) {
                    console.log(result.payload);
                }
            }
        } catch (err) {
            console.error("Ошибка аутентификации:", err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            if (!user?.email_verified_at) {
                navigate("/verify-notice");
            } else {
                navigate("/");
            }
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <Card variant="outlined">
            <Logo />
            <Typography
                component="h1"
                variant="h4"
                sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
            >
                Войти
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    gap: 2,
                }}
            >
                {/* Поле для ввода электронной почты */}
                <FormControl>
                    <FormLabel htmlFor="email">
                        Адрес электронной почты
                    </FormLabel>
                    <TextField
                        error={emailError}
                        helperText={emailErrorMessage}
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={emailError ? "error" : "primary"}
                    />
                </FormControl>
                {/* Поле для ввода пароля */}
                <FormControl>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <FormLabel htmlFor="password">Пароль</FormLabel>
                        {/* Ссылка-кнопка Забыли пароль? */}
                        <Link
                            component="button"
                            type="button"
                            onClick={handleClickOpen}
                            variant="body2"
                            sx={{ alignSelf: "baseline" }}
                        >
                            Забыли пароль?
                        </Link>
                    </Box>
                    <TextField
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={passwordError ? "error" : "primary"}
                    />
                </FormControl>
                {/* Checkbox запомнить меня */}
                <FormControlLabel control={
                        <Checkbox
                            checked={rememberMe}
                            onChange={handleRememberMeChange}
                            color="primary"
                        />
                    }
                    label="Запомнить меня"
                />
                <ForgotPassword open={open} handleClose={handleClose} />
                {/* Кнопка Войти */}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    onClick={validateInputs}
                >
                    Войти
                </Button>
                {/* У вас нет учетной записи? */}
                <Typography sx={{ textAlign: "center" }}>
                    У вас нет учетной записи?{" "}
                    <span>
                        <Link
                            href="/register"
                            variant="body2"
                            sx={{ alignSelf: "center" }}
                        >
                            Зарегистрироваться
                        </Link>
                    </span>
                </Typography>
            </Box>
        </Card>
    );
}
