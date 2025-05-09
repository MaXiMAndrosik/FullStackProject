import { forwardRef } from "react";
import { IMaskInput } from "react-imask";

const PhoneMaskInput = forwardRef((props, ref) => {
    const { onChange, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask="+375 (00) 000-00-00"
            placeholder="+375 (__) ___-__-__"
            inputRef={ref}
            onAccept={(value) =>
                onChange({ target: { name: props.name, value } })
            }
            overwrite
        />
    );
});

export default PhoneMaskInput;
