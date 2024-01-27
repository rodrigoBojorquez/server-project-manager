import express from "express"
import cors from "cors"

// ROUTES HERE
import employeesRouter from "./src/routes/employeesRoutes.js"

const app = express()

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    methods: 'GET, POST, PATCH, DELETE',
    allowedHeaders: 'Content-Type'
}))
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something got wrong')
})

app.use("/project-manager", employeesRouter)

app.listen(8000, () => {
    console.log(`Server running in port ${8000}`)
})