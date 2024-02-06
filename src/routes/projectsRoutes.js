import express from "express"
import { body, query, param } from "express-validator"
import { createProject, deleteProject, getProjects, updateProject, getProjet } from "../controllers/projects.js"
import { verifyToken } from "../middleware/validateToken.js"
import {  assignPermissions } from "../middleware/assignPermissions.js"

const projectRouter = express.Router()

// VALIDATIONS HERE
const getProjectsChain = [
    query("page").isInt().withMessage("invalid num page"),
    query("search").trim().isLength({min: 3, max:255}).optional().withMessage("invalid searc"),
    query("state").isInt().optional().withMessage("invalid state")
]

const createProjectChain = [
    body("projectName").trim().isString().isLength({min: 5, max: 255}).withMessage("the name must be greater than 5 and lower than 255"),
    body("projectDescription").trim().isString().isLength({min: 3, max: 1000}).withMessage("description must be greater than 3 and lower than 1000"),
    body("materials").isArray().optional()       // me gustaria validar mas pero no me deja
]

const updateProjectChain = [
    param("id").isNumeric({no_symbols: true}).withMessage("invalid id format"),
    body("projectName").trim().isString().isLength({min: 5, max: 255}).optional().withMessage("the name must be greater than 5 and lower than 255"),
    body("projectDescription").trim().isString().isLength({min: 3, max: 1000}).optional().withMessage("description must be greater than 3 and lower than 1000"),
    body("materials").isArray().optional()
]

const deleteProjectChain = [
    param("id").isNumeric({no_symbols: true}).withMessage("invalid id format"),
]


// ROUTES HERE
// projectRouter.post("/project",verifyToken, assignPermissions('administrator'), createProject)
projectRouter.post("/project", createProject)
// projectRouter.get("/projects",verifyToken,assignPermissions(['administrator','team leader']) , getProjects)
projectRouter.get("/projects",getProjectsChain, getProjects)
projectRouter.get("/project/:id",getProjet);
projectRouter.put("/projects/:id",verifyToken, assignPermissions('administrator'), updateProject)
// projectRouter.delete("/projects/:id",verifyToken, assignPermissions('administrator'), deleteProject)
projectRouter.delete("/projects/:id", deleteProject)


export default projectRouter