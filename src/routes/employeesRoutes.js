import express from "express"
import { body, query } from "express-validator"
import { activateUser, createEmployee } from "../controllers/employees.js"

const employeesRouter = express.Router()

// VALIDATIONS HERE
const createEmployeeChain = [
    query("rol").trim().isString().isLength({min: 3}).withMessage("the user rol must be specified"),
    body("username").trim().isString().isLength({min: 8, max: 255}).withMessage("username length must be greater than 8 and lower than 255"),
    body("email").trim().isEmail().withMessage("Invalid email"),
    body("speciality").trim().isString().isLength({min: 3, max: 255}).optional().withMessage("speciality length must be greater than 3 and lower than 255"),
]

const activateUserChain = [
    body("token").trim().isString().isLength({min:20, max: 20}).withMessage("invalid activation token"),
    body("password").trim().isString().isLength({min: 8, max: 255}).withMessage("the password must be greater than 8 and lower than 255")
]


// ROUTES HERE
employeesRouter.post("/employees", createEmployeeChain, createEmployee)
employeesRouter.post("/user/activate", activateUserChain, activateUser)

export default employeesRouter