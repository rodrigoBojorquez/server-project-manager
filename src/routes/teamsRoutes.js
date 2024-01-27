import express from "express"
import { createTeam } from "../controllers/teams.js"
import { body } from "express-validator"

const teamRouter = express.Router()

// VALIDATIONS HERE
const createTeamChain = [
    body("teamName").trim().isString().isLength({min: 5, max: 255}).withMessage("invalid team name"),
    body("projectId").isNumeric({no_symbols: true}).withMessage("invalid project id"),
    body("leaderId").isNumeric({no_symbols: true}).withMessage("leader id must be specified"),
    body('members').isArray({ min: 1 }).withMessage('Minimum 1 member per team'),
    body('members.*.id_user').isNumeric({ no_symbols: true }).withMessage('Invalid member id'),
]

// ROUTES HERE
teamRouter.post("/team", createTeamChain, createTeam)

export default teamRouter