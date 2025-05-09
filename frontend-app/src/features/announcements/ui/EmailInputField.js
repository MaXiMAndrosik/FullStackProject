import StyledTextArea from "../../../shared/ui/StyledTextArea";

export const EmailInputField = ({
    value = "",
    onChange,
    name = "contacts.email",
    ...props
}) => {
    const handleChange = (e) => {
        if (typeof onChange === "function" && e && e.target) {
            onChange(e.target.value);
        }
    };

    return (
        <StyledTextArea
            label="Email"
            value={value}
            onChange={handleChange}
            fullWidth
            name={name}
            InputProps={{
                inputProps: {
                    pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
                    type: "email",
                },
            }}
            {...props}
        />
    );
};
