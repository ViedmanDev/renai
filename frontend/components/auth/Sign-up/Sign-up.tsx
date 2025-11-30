"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/app/auth/login/login.css";

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    aceptaTerminos: boolean;
}

interface FormErrors {
    nombre?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    aceptaTerminos?: string;
    general?: string;
}

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        aceptaTerminos: false
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    // Validaciones
    const validateNombre = (value: string): string => {
        if (!value.trim()) {
            return "El nombre es requerido";
        }
        if (value.trim().length < 2) {
            return "El nombre debe tener al menos 2 caracteres";
        }
        return "";
    };

    const validateEmail = (value: string): string => {
        if (!value) {
            return "El email es requerido";
        }
        if (!value.includes("@")) {
            return "El email debe contener @";
        }
        if (!value.includes(".")) {
            return "El email debe tener un dominio válido";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return "El formato del email no es válido";
        }
        return "";
    };

    const validatePassword = (value: string): string => {
        if (!value) {
            return "La contraseña es requerida";
        }
        if (value.length < 6) {
            return "La contraseña debe tener al menos 6 caracteres";
        }
        return "";
    };

    const validateConfirmPassword = (value: string, password: string): string => {
        if (!value) {
            return "Confirma tu contraseña";
        }
        if (value !== password) {
            return "Las contraseñas no coinciden";
        }
        return "";
    };

    // Manejadores de cambio
    const handleNombreChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, name: value }));

        if (errors.nombre || value) {
            setErrors(prev => ({
                ...prev,
                nombre: validateNombre(value),
                general: ""
            }));
        }
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, email: value }));

        if (errors.email || value) {
            setErrors(prev => ({
                ...prev,
                email: validateEmail(value),
                general: ""
            }));
        }
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, password: value }));

        if (errors.password || value) {
            setErrors(prev => ({
                ...prev,
                password: validatePassword(value),
                general: ""
            }));
        }


        if (formData.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
            }));
        }
    };

    const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, confirmPassword: value }));

        if (errors.confirmPassword || value) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: validateConfirmPassword(value, formData.password),
                general: ""
            }));
        }
    };

    const handleTerminosChange = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setFormData(prev => ({ ...prev, aceptaTerminos: checked }));

        if (errors.aceptaTerminos) {
            setErrors(prev => ({
                ...prev,
                aceptaTerminos: checked ? "" : "Debes aceptar los términos y condiciones"
            }));
        }
    };

    // Validar todo el formulario
    const validateForm = (): boolean => {
        const nombreError = validateNombre(formData.name);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
        const terminosError = formData.aceptaTerminos ? "" : "Debes aceptar los términos y condiciones";

        setErrors({
            nombre: nombreError,
            email: emailError,
            password: passwordError,
            confirmPassword: confirmPasswordError,
            aceptaTerminos: terminosError,
            general: ""
        });

        return !nombreError && !emailError && !passwordError && !confirmPasswordError && !terminosError;
    };

    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validar formulario antes de enviar
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Registro exitoso - redirigir al login
                router.push('/auth/login?registered=true');
            } else {
                // Manejar errores del backend
                const errorMessage = data.message || "Error al crear la cuenta";

                if (errorMessage.toLowerCase().includes("email") ||
                    errorMessage.toLowerCase().includes("existe")) {
                    setErrors(prev => ({
                        ...prev,
                        email: "Este email ya está registrado"
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        general: errorMessage
                    }));
                }
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                general: "Error de conexión. Por favor, intenta nuevamente."
            }));
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <h2 className="form-title">Crear Cuenta</h2>

            <form className="login-form" onSubmit={handleRegister} noValidate>

                {/* Error general */}
                {errors.general && (
                    <div style={{
                        backgroundColor: "#fee",
                        border: "1px solid #fcc",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "16px",
                        color: "#c33"
                    }}>
                        <strong>Error:</strong> {errors.general}
                    </div>
                )}

                {/* Campo Nombre */}
                <div style={{ marginBottom: "4px" }}>Nombre completo</div>
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Ingresa tu nombre"
                        className={`input-field ${errors.nombre ? "input-error" : ""}`}
                        value={formData.name}
                        onChange={handleNombreChange}
                        disabled={loading}
                        style={{
                            borderColor: errors.nombre ? "#f44336" : undefined
                        }}
                    />
                    <i className="material-symbols-rounded">person</i>
                </div>
                {errors.nombre && (
                    <div style={{
                        color: "#f44336",
                        fontSize: "13px",
                        marginTop: "4px",
                        marginBottom: "12px"
                    }}>
                        {errors.nombre}
                    </div>
                )}

                {/* Campo Email */}
                <div style={{ marginBottom: "4px", marginTop: "12px" }}>Email</div>
                <div className="input-wrapper">
                    <input
                        type="email"
                        placeholder="Ingresa tu email"
                        className={`input-field ${errors.email ? "input-error" : ""}`}
                        value={formData.email}
                        onChange={handleEmailChange}
                        disabled={loading}
                        style={{
                            borderColor: errors.email ? "#f44336" : undefined
                        }}
                    />
                    <i className="material-symbols-rounded">mail</i>
                </div>
                {errors.email && (
                    <div style={{
                        color: "#f44336",
                        fontSize: "13px",
                        marginTop: "4px",
                        marginBottom: "12px"
                    }}>
                        {errors.email}
                    </div>
                )}

                {/* Campo Contraseña */}
                <div style={{ marginBottom: "4px", marginTop: "12px" }}>Contraseña</div>
                <div className="input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingresa tu contraseña"
                        className={`input-field ${errors.password ? "input-error" : ""}`}
                        value={formData.password}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        style={{
                            borderColor: errors.password ? "#f44336" : undefined
                        }}
                    />
                    <i
                        className="material-symbols-rounded"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "visibility_off" : "visibility"}
                    </i>
                </div>
                {errors.password && (
                    <div style={{
                        color: "#f44336",
                        fontSize: "13px",
                        marginTop: "4px",
                        marginBottom: "12px"
                    }}>
                        {errors.password}
                    </div>
                )}

                {/* Campo Confirmar Contraseña */}
                <div style={{ marginBottom: "4px", marginTop: "12px" }}>Confirmar contraseña</div>
                <div className="input-wrapper">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirma tu contraseña"
                        className={`input-field ${errors.confirmPassword ? "input-error" : ""}`}
                        value={formData.confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        disabled={loading}
                        style={{
                            borderColor: errors.confirmPassword ? "#f44336" : undefined
                        }}
                    />
                    <i
                        className="material-symbols-rounded"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                    </i>
                </div>
                {errors.confirmPassword && (
                    <div style={{
                        color: "#f44336",
                        fontSize: "13px",
                        marginTop: "4px",
                        marginBottom: "12px"
                    }}>
                        {errors.confirmPassword}
                    </div>
                )}

                {/* Checkbox de términos */}
                <div style={{ marginTop: "16px", marginBottom: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={formData.aceptaTerminos}
                            onChange={handleTerminosChange}
                            disabled={loading}
                            style={{ marginRight: "8px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "14px" }}>
                            Acepto los{" "}
                            <Link href="/terminos" style={{ textDecoration: "underline" }}>
                                términos y condiciones
                            </Link>
                        </span>
                    </label>
                    {errors.aceptaTerminos && (
                        <div style={{
                            color: "#f44336",
                            fontSize: "13px",
                            marginTop: "4px"
                        }}>
                            {errors.aceptaTerminos}
                        </div>
                    )}
                </div>

                <button
                    className="login-button"
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: "16px"
                    }}
                >
                    {loading ? "Creando cuenta..." : "Registrarse"}
                </button>
            </form>

            <p>
                ¿Ya tienes cuenta? <Link href="/auth/login">Inicia sesión aquí</Link>
            </p>

            <p className="separator">
                <span>or</span>
            </p>

            <div className="social-login">
                <button
                    className="social-button"
                    onClick={() => {
                        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/google`;
                    }}
                    type="button"
                >
                    <img src="/google-icon.png" alt="" className="social-icon" />
                    Continue con Google
                </button>
                <br />
                <button className="social-button social-apple">
                    <img src="/logo-apple.png" alt="" className="social-icon" />
                    Continue con Apple
                </button>
            </div>
        </div>
    );
}