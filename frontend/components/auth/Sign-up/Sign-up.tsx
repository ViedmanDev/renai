"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/app/auth/login/login.css";
import { FormData, FormErrors } from "@/types/auth/Sign-Up";
import { validateNombre, validateEmail, validatePassword, validateConfirmPassword } from "@/utils/validator";
import { handleNombreChange, handleEmailChange, handlePasswordChange, handleConfirmPasswordChange, handleTerminosChange } from "@/utils/handlers";

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
            {/* Botón de flecha para volver atrás */}
            <button
                type="button"
                onClick={() => router.push('/auth/login')}
                aria-label="Go back to login"
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#555",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1.2rem"
                }}
            >
                <span className="material-symbols-rounded" aria-hidden="true" style={{ fontSize: "2rem", marginRight: "4px" }}>
                    arrow_back
                </span>
            </button>
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
                        onChange={e => handleNombreChange(e, { formData, setFormData, errors, setErrors })}
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
                        onChange={e => handleEmailChange(e, { formData, setFormData, errors, setErrors })}
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
                        onChange={e => handlePasswordChange(e, { formData, setFormData, errors, setErrors })}
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
                        onChange={e => handleConfirmPasswordChange(e, { formData, setFormData, errors, setErrors })}
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
                            onChange={e => handleTerminosChange(e, { formData, setFormData, errors, setErrors })}
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
                    disabled={loading || !formData.aceptaTerminos}
                    style={{
                        marginTop: "16px",
                        opacity: (loading || !formData.aceptaTerminos) ? 0.7 : 1,
                        cursor: (loading || !formData.aceptaTerminos) ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Creando cuenta..." : "Registrarse"}
                </button>
            </form>

        </div>
    );
}