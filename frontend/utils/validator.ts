// Validadores para el registro de usuario

export const validateNombre = (value: string): string => {
    if (!value.trim()) return "El nombre es requerido";
    if (value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
    return "";
};

export const validateEmail = (value: string): string => {
    if (!value) return "El email es requerido";
    if (!value.includes("@")) return "El email debe contener @";
    if (!value.includes(".")) return "El email debe tener un dominio válido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "El formato del email no es válido";
    return "";
};

export const validatePassword = (value: string): string => {
    if (!value) return "La contraseña es requerida";
    if (value.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    return "";
};

export const validateConfirmPassword = (value: string, password: string): string => {
    if (!value) return "Confirma tu contraseña";
    if (value !== password) return "Las contraseñas no coinciden";
    return "";
};
