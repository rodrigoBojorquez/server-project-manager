import express from "express"
import { body, query } from "express-validator"
import { getEmployees } from "../controllers/employees.js"

const employeesRouter = express.Router()

// VALIDATIONS HERE


// ROUTES HERE

employeesRouter.post('/employees',getEmployees);

export default employeesRouter