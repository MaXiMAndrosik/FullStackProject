import { CheckMark } from "../ui/CheckMark";

export const LoyalityContent = () => {
    return (
        <div className="registration-form__content">
            <div className="registration-form__content_title">
                <p>LOYALTY HAS ITS PERKS</p>
            </div>
            <div className="registration-form__content_text">
                <p>
                    Get in on the loyalty program where you can earn points and
                    unlock serious perks. Starting with these as soon as you
                    join:
                </p>
            </div>
            <div className="registration-form__content_list">
                <ul>
                    <li>
                        <CheckMark /> 15% off welcome offer
                    </li>
                    <li>
                        <CheckMark /> Free shipping, returns and exchanges on
                        all orders
                    </li>
                    <li>
                        <CheckMark /> $10 off a purchase on your birthda
                    </li>
                    <li>
                        <CheckMark /> Early access to products
                    </li>
                    <li>
                        <CheckMark /> Exclusive offers & rewards
                    </li>
                </ul>
            </div>
        </div>
    );
};
