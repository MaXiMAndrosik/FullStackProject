import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerSuccess, selectIsAuth } from "../model/authSlice";
import { RightArrow } from "../ui/RightArrow";
import { toast } from "react-toastify";

const RegistrationForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuth = useSelector(selectIsAuth);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gender: "male",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Если всё ок — регистрируем
        dispatch(registerSuccess(formData));
        toast.success("User successfully registered", {
            position: "top-right",
            autoClose: 1000,
        });

        navigate(-1);

    };

    // Если пользователь уже авторизован — редирект на главную
    if (isAuth) {
        // return <Navigate to="/" />;
    }

    return (
        <form
            id="input"
            action="#"
            method="post"
            className="registration-form__leftPart"
            onSubmit={handleSubmit}
        >
            <div className="registration-form__conteiner">
                <p className="registration-form__title">Your Name</p>
                <div className="registration-form__input">
                    <input
                        type="text"
                        autoComplete="on"
                        name="firstName"
                        className="registration-form__field"
                        placeholder="First Name"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        autoComplete="on"
                        name="lastName"
                        className="registration-form__field"
                        placeholder="Last Name"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="registration-form__radioInput">
                <input
                    className="registration-form__radioInput_radio"
                    type="radio"
                    name="gender"
                    id="Male"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleChange}
                />
                <label
                    className="registration-form__radioInput_label"
                    htmlFor="Male"
                >
                    Male
                </label>
                <input
                    className="registration-form__radioInput_radio"
                    type="radio"
                    name="gender"
                    id="Female"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleChange}
                />
                <label
                    className="registration-form__radioInput_label"
                    htmlFor="Female"
                >
                    Female
                </label>
            </div>

            <div className="registration-form__conteiner">
                <p className="registration-form__title">Your Name</p>
                <div className="registration-form__input">
                    <input
                        type="email"
                        autoComplete="on"
                        name="email"
                        className="registration-form__field"
                        placeholder="Email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        minLength="8"
                        autoComplete="current-password"
                        name="password"
                        className="registration-form__field"
                        placeholder="Password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="registration-form__text">
                <p>
                    Please use 8 or more characters, with at least 1 number and
                    a mixture of uppercase and lowercase letters
                </p>
            </div>

            <button
                form="input"
                type="submit"
                className="registration-form__button"
            >
                JOIN NOW <RightArrow />
            </button>
        </form>
    );
};

export default RegistrationForm;
