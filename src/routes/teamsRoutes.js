import express from "express"
import { createTeam, deleteTeam, getTeams, updateTeam } from "../controllers/teams.js"
import { body, param, query } from "express-validator"

const teamRouter = express.Router()

// VALIDATIONS HERE
const createTeamChain = [
    body("teamName").trim().isString().isLength({min: 5, max: 255}).withMessage("invalid team name"),
    body("projectId").isNumeric({no_symbols: true}).withMessage("invalid project id"),
    body("leaderId").isNumeric({no_symbols: true}).withMessage("leader id must be specified"),
    body('members').isArray({ min: 1 }).withMessage('Minimum 1 member per team'),
    body('members.*.id_user').isNumeric({ no_symbols: true }).withMessage('Invalid member id'),
]

const getTeamsChain = [
    query("page").isInt({min: 1}).withMessage("invalid page"),
    query("search").trim().isString().isLength({min:3, max:255}).optional().withMessage("minimun 3 chars to search")  
]

const updateTeamChain = [

]

const deleteTeamChain = [

]

// ROUTES HERE
teamRouter.post("/team", createTeamChain, createTeam)
teamRouter.get("/team", getTeamsChain, getTeams)
teamRouter.put("/team/:id", updateTeamChain, updateTeam)
teamRouter.delete("/team/:id", deleteTeamChain, deleteTeam)


export default teamRouter