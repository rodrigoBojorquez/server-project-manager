import swaggerJSDoc from "swagger-jsdoc"

const options = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Project-manager",
            version: "1.0.0",
            description: "API para gestionar proyectos"
        }
    },
    apis: ['./src/routes/*js']
}

export const swaggerSpec = swaggerJSDoc(options)