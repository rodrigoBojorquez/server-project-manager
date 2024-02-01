import express from "express"
import { createTeam, deleteTeam, getTeams, updateTeam } from "../controllers/teams.js"
import { body, param, query } from "express-validator"
import { verifyToken } from "../middleware/validateToken.js"
import { assignPermissions } from "../middleware/assignPermissions.js"

const teamRouter = express.Router()

// VALIDATIONS HERE
// const createTeamChain = [
//     body("teamName").trim().isString().isLength({min: 5, max: 255}).withMessage("invalid team name"),
//     body("projectId").isNumeric({no_symbols: true}).withMessage("invalid project id"),
//     body("leaderId").isNumeric({no_symbols: true}).withMessage("leader id must be specified"),
//     body('members').isArray({ min: 1 }).withMessage('Minimum 1 member per team'),
//     body('members.*.id_user').isNumeric({ no_symbols: true }).withMessage('Invalid member id'),
// ]

// const getTeamsChain = [
//     query("page").isInt({min: 1}).withMessage("invalid page"),
//     query("search").trim().isString().isLength({min:3, max:255}).optional().withMessage("minimun 3 chars to search")  
// ]

// const updateTeamChain = [
//     param("id").isNumeric({no_symbols: true}).withMessage("invalid id format"),
//     body("teamName").trim().isString().isLength({min: 5, max: 255}).optional().withMessage("invalid team name"),
//     body("projectId").isNumeric({no_symbols: true}).optional().withMessage("invalid project id"),
//     body("leaderId").isNumeric({no_symbols: true}).optional().withMessage("leader id must be specified"),
//     body('members').isArray({ min: 1 }).optional().withMessage('Minimum 1 member per team'),
//     body('members.*.id_user').isNumeric({ no_symbols: true }).optional().withMessage('Invalid member id'),
// ]

// const deleteTeamChain = [
//     param("id").isNumeric({no_symbols: true}).withMessage("invalid id format"),
// ]

// ROUTES HERE
teamRouter.post("/team",verifyToken,assignPermissions('administrator') , createTeam)
teamRouter.get("/team",verifyToken,assignPermissions(['administrator','team leader','employee']), getTeams)
teamRouter.put("/team/:id",verifyToken,assignPermissions('administrator') , updateTeam)
teamRouter.delete("/team/:id",verifyToken,assignPermissions('administrator') , deleteTeam)


export default teamRouter