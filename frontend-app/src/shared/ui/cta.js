import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TelegramIcon from "@mui/icons-material/Telegram";

export const CTA = () => {
    return (
        <Box
            sx={(theme) => ({
                textAlign: "center",
                p: 4,
                borderRadius: 2,
                color: "primary.contrastText",
                backgroundColor: "primary.main",
                ...theme.applyStyles("dark", {
                    backgroundColor: "hsl(210, 100%, 16%)",
                }),
            })}
        >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Остались вопросы?
            </Typography>
            <Typography sx={{ mb: 3 }}>
                Свяжитесь с нами через Telegram или по телефону{" "}
                {process.env.REACT_APP_ORGANIZATION_PHONE1}
            </Typography>
            <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<TelegramIcon />}
                href="//t.me/zenitchik4"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    fontWeight: "bold",
                    px: 4,
                }}
            >
                Написать в Telegram
            </Button>
        </Box>
    );
};
