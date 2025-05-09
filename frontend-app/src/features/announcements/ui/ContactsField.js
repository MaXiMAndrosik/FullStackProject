import { Box, Typography } from "@mui/material";
import { PhoneInputField } from "./PhoneInputField";
import { EmailInputField } from "./EmailInputField";

export const ContactsField = ({ form, onChange }) => {
    return (
        <Box>
            <Typography variant="body2" sx={{ color: "primary.main", mb: 0.5 }}>
                Контакты
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                    width: "100%",
                }}
            >
                <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 50%" } }}>
                    <PhoneInputField
                        value={form.contacts?.phone ?? ""}
                        onChange={(value) =>
                            onChange("contacts.phone", value || "")
                        }
                    />
                </Box>

                <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 50%" } }}>
                    <EmailInputField
                        value={form.contacts?.email ?? ""}
                        onChange={(value) =>
                            onChange("contacts.email", value || "")
                        }
                    />
                </Box>
            </Box>
        </Box>
    );
};
