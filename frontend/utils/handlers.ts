import { ChangeEvent } from "react";
import { validateNombre, validateEmail, validatePassword, validateConfirmPassword } from "./validator";
import { FormErrors } from "@/types/auth/Sign-Up";

// Tipos de los setters esperados

type SetFormData<T> = (updater: (prev: T) => T) => void;
type SetErrors = (updater: (prev: FormErrors) => FormErrors) => void;
type FormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    aceptaTerminos: boolean;
};

type SetBoolean = (value: boolean) => void;

type HandlersArg = {
    formData: FormData;
    setFormData: SetFormData<FormData>;
    errors: FormErrors;
    setErrors: SetErrors;
};

export function handleNombreChange(e: ChangeEvent<HTMLInputElement>, { setFormData, errors, setErrors }: HandlersArg) {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    if (errors.nombre || value) {
        setErrors(prev => ({ ...prev, nombre: validateNombre(value), general: "" }));
    }
}

export function handleEmailChange(e: ChangeEvent<HTMLInputElement>, { setFormData, errors, setErrors }: HandlersArg) {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    if (errors.email || value) {
        setErrors(prev => ({ ...prev, email: validateEmail(value), general: "" }));
    }
}

export function handlePasswordChange(e: ChangeEvent<HTMLInputElement>, { setFormData, errors, setErrors, formData }: HandlersArg) {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    if (errors.password || value) {
        setErrors(prev => ({ ...prev, password: validatePassword(value), general: "" }));
    }
    if (formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(formData.confirmPassword, value) }));
    }
}

export function handleConfirmPasswordChange(e: ChangeEvent<HTMLInputElement>, { setFormData, errors, setErrors, formData }: HandlersArg) {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    if (errors.confirmPassword || value) {
        setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value, formData.password), general: "" }));
    }
}

export function handleTerminosChange(e: ChangeEvent<HTMLInputElement>, { setFormData, errors, setErrors }: HandlersArg) {
    const checked = e.target.checked;
    setFormData(prev => ({ ...prev, aceptaTerminos: checked }));
    if (errors.aceptaTerminos) {
        setErrors(prev => ({ ...prev, aceptaTerminos: checked ? "" : "Debes aceptar los términos y condiciones" }));
    }
}
