import PhoneMaskInput from "../../../shared/libs/PhoneMaskInput";
import StyledTextArea from "../../../shared/ui/StyledTextArea";

export const PhoneInputField = ({
    value = "",
    onChange,
    name = "contacts.phone",
    ...props
}) => {
    const handleChange = (e) => {
        if (typeof onChange === "function" && e && e.target) {
            onChange(e.target.value);
        }
    };

    return (
        <StyledTextArea
            label="Телефон"
            name={name}
            value={value}
            onChange={handleChange}
            fullWidth
            InputProps={{
                inputComponent: PhoneMaskInput,
                inputProps: {
                    name: name,
                },
            }}
            {...props}
        />
    );
};
