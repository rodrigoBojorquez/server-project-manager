import express from "express"
import { body, query } from "express-validator"
import { createProject, deleteProject, getProjects, updateProject } from "../controllers/projects.js"

const projectRouter = express.Router()

// VALIDATIONS HERE
const createProjectChain = [
    body("projectName").trim().isString().isLength({min: 5, max: 255}).withMessage("the name must be greater than 5 and lower than 255"),
    body("projectDescription").trim().isString().isLength({min: 3, max: 1000}).withMessage("description must be greater than 3 and lower than 1000"),
    body("materials").isArray().optional()       // me gustaria validar mas pero no me deja
]

const getProjectsChain = [
    query("page").isInt({min: 1}).withMessage("invalid page"),
    query("search").trim().isString().isLength({min:3, max:255}).optional().withMessage("minimun 3 chars to search")  
]

const updateProjectChain = [
    body("projectName").trim().isString().isLength({min: 5, max: 255}).optional().withMessage("the name must be greater than 5 and lower than 255"),
    body("projectDescription").trim().isString().isLength({min: 3, max: 1000}).optional().withMessage("description must be greater than 3 and lower than 1000"),
]

const deleteProjectChain = [

]


// ROUTES HERE
projectRouter.post("/project", createProjectChain, createProject)
projectRouter.get("/projects", getProjectsChain, getProjects)
projectRouter.put("/projects/:id", updateProjectChain, updateProject)
projectRouter.delete("/projects/:id", deleteProjectChain, deleteProject)

export default projectRouter