import {z} from 'zod';



// Validacion de registro de usuario
export const activateSchema = z.object({
    token: z.string({
        required_error: "El token es requerido"
    }),

    password: z.string({
        required_error: "La contraseña es requerida"
    }).min(6,{
        message:"La contraseña debe tener 6 caracteres minimo"
    }),
});


export const loginSchema = z.object({
    email: z.string({
        required_error: "El correo es requerido"
    }).email({
        message: "El correo es invalido"
    }),
    password: z.string({
        required_error: "La contraseña es requerida"
    }).min(6,{
        message:"La contraseña debe tener 6 caracteres minimo"
    }),
});