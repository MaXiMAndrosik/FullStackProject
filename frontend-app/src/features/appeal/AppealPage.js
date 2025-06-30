import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import StyledTextArea from "../../shared/ui/StyledTextArea";
import TelegramIcon from "@mui/icons-material/Telegram";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { createAppeal } from "../../app/api/appealAPI";
import PhoneMaskInput from "../../shared/libs/PhoneMaskInput";
import { CTA } from "../../shared/ui/cta";

export default function AppealPage() {
    const authUser = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: authUser?.email,
        phone: "",
        message: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setFormData({
            name: "",
            email: authUser?.email,
            phone: "",
            message: "",
        });

        try {
            const createdAppeal = await createAppeal(formData);
            return createdAppeal;
        } catch (error) {
            setIsSuccess(false);
        } finally {
            setIsSubmitting(false);
            if (isSuccess) {
                navigate("/");
            }
        }
    };

    return (
        <Box
            sx={(theme) => ({
                width: "100%",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
                ...theme.applyStyles("dark", {
                    backgroundImage:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
                }),
            })}
        >
            <Container
                // maxWidth="lg"
                sx={{
                    pt: { xs: 4, sm: 8 },
                    pb: { xs: 4, sm: 8 },
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        textAlign: "center",
                        mb: 2,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                    }}
                >
                    Обращение к
                    <Typography
                        component="span"
                        variant="h2"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                    >
                        правлению
                    </Typography>
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        textAlign: "center",
                        mb: 4,
                        maxWidth: 600,
                        mx: "auto",
                    }}
                >
                    Задайте вопрос, оставьте предложение или сообщите о
                    проблеме. Мы ответим вам в ближайшее время.
                </Typography>

                <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
                    {/* Форма обратной связи */}
                    <Box sx={{ flex: 2 }}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <StyledTextArea
                                    name="name"
                                    autoComplete="name"
                                    label="Ваше имя"
                                    variant="outlined"
                                    fullWidth
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                                <StyledTextArea
                                    label="Email"
                                    autoComplete="email"
                                    variant="outlined"
                                    fullWidth
                                    value={formData.email}
                                    onChange={handleChange}
                                    name="email"
                                    InputProps={{
                                        inputProps: {
                                            pattern:
                                                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
                                            type: "email",
                                            readOnly: true,
                                        },
                                    }}
                                    required
                                />

                                <StyledTextArea
                                    name="phone"
                                    autoComplete="phone"
                                    label="Телефон"
                                    variant="outlined"
                                    inputMode="tel"
                                    type="tel"
                                    fullWidth
                                    value={formData.phone}
                                    onChange={handleChange}
                                    InputProps={{
                                        inputComponent: PhoneMaskInput,
                                    }}
                                />

                                <StyledTextArea
                                    name="message"
                                    label="Сообщение"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    sx={{ alignSelf: "flex-end", px: 4 }}
                                >
                                    Отправить
                                </Button>
                            </Stack>
                        </form>
                    </Box>

                    {/* Альтернативные способы связи */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{ mb: 2, fontWeight: "bold" }}
                        >
                            Другие способы связи
                        </Typography>

                        <Stack spacing={3}>
                            <Button
                                variant="outlined"
                                startIcon={<TelegramIcon />}
                                href="http://t.me/zenitchik4"
                                target="_blank"
                                rel="noopener"
                                sx={{ justifyContent: "flex-start" }}
                            >
                                Написать в Telegram
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<EmailIcon />}
                                href={`mailto:${process.env.REACT_APP_ORGANIZATION_EMAIL1}`}
                                sx={{ justifyContent: "flex-start" }}
                            >
                                {process.env.REACT_APP_ORGANIZATION_EMAIL1}
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<PhoneIcon />}
                                href={`tel:${process.env.REACT_APP_ORGANIZATION_PHONE1?.replace(
                                    /\D/g,
                                    ""
                                )}`}
                                sx={{ justifyContent: "flex-start" }}
                            >
                                {process.env.REACT_APP_ORGANIZATION_PHONE1}
                            </Button>

                            <Typography variant="body2" color="text.secondary">
                                {process.env.REACT_APP_ORGANIZATION_ADDRESS}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
            <Container>
                <CTA />
            </Container>
        </Box>
    );
}
