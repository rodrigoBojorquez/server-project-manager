import express from "express"
import { body } from "express-validator"
import { createProject } from "../controllers/projects.js"

const projectRouter = express.Router()

// VALIDATIONS HERE
const createProjectChain = [
    body("projectName").trim().isString().isLength({min: 5, max: 255}).withMessage("the name must be greater than 5 and lower than 255"),
    body("projectDescription").trim().isString().isLength({min: 3, max: 1000}).withMessage("description must be greater than 3 and lower than 1000")
]


// ROUTES HERE
projectRouter.post("/project", createProjectChain, createProject)

export default projectRouter