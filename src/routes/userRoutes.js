import express from "express"
import { body, query, param } from "express-validator"
import { activateUser, createUser, deleteUser } from "../controllers/users.js"

const userRouter = express.Router()

// VALIDATIONS HERE
const createUserChain = [
    query("rol").trim().isString().isLength({min: 3}).withMessage("the user rol must be specified"),
    body("username").trim().isString().isLength({min: 8, max: 255}).withMessage("username length must be greater than 8 and lower than 255"),
    body("email").trim().isEmail().withMessage("Invalid email"),
    body("speciality").trim().isString().isLength({min: 3, max: 255}).optional().withMessage("speciality length must be greater than 3 and lower than 255"),
]

const activateUserChain = [
    body("token").trim().isString().isLength({min:20, max: 20}).withMessage("invalid activation token"),
    body("password").trim().isString().isLength({min: 8, max: 255}).withMessage("the password must be greater than 8 and lower than 255")
]

const deleteUserChain = [
    param("id").isNumeric({no_symbols: true}).withMessage("invalid id")
]

// ROUTES HERE
userRouter.put("/user/activate", activateUserChain, activateUser)
userRouter.post("/user", createUserChain, createUser)
userRouter.put("/public/user/activate", activateUserChain, activateUser)
userRouter.delete("/user/:id", deleteUserChain, deleteUser)

export default userRouter