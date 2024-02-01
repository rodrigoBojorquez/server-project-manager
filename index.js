import express from "express"
import cors from "cors"
import morgan from "morgan"
import swaggerUi from "swagger-ui-express"
import {swaggerSpec} from "./swaggerConfig.js"

// ROUTES HERE
import employeesRouter from "./src/routes/employeesRoutes.js"
import userRouter from "./src/routes/userRoutes.js"
import teamRouter from "./src/routes/teamsRoutes.js"
import projectRouter from "./src/routes/projectsRoutes.js"
import materialsRouter from "./src/routes/materialsRoutes.js"
import authRoutes from "./src/routes/authRoutes.js"

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(cors({
    origin: "http://localhost:5173",
    methods: 'GET, POST, PATCH, DELETE',
    allowedHeaders: 'Content-Type'
}))
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something got wrong')
})

app.use("/project-manager", employeesRouter, userRouter, teamRouter, projectRouter, materialsRouter,authRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.listen(8000, () => {
    console.log(`Server running in port ${8000}`)
})