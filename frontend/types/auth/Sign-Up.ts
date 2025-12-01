export interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    aceptaTerminos: boolean;
}

export interface FormErrors {
    nombre?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    aceptaTerminos?: string;
    general?: string;
}
