import connection from "../database.js"
import { validationResult } from "express-validator"

export const createTeam = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    try {
        const { teamName, projectId, leaderId, members } = req.body

        return res.json({
            message: "team added successfully",
            data: req.body
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}