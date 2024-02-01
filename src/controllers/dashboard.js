import connection from "../database.js"
import { validationResult } from "express-validator"

export const getPieChartData = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    try {
        const query = `
        SELECT
            COUNT(*) AS total_projects,
            COUNT(CASE WHEN project_state_fk = 1 THEN 1 END) AS in_course,
            COUNT(CASE WHEN project_state_fk = 2 THEN 1 END) AS finished,
            COUNT(CASE WHEN project_state_fk = 3 THEN 1 END) AS canceled,
            COUNT(CASE WHEN project_state_fk = 4 THEN 1 END) AS in_pause
        FROM projects
        `

        const [ results ] = await connection.promise().query(query)

        return res.json({
            message: "successfull request",
            data:  results[0]
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}


export const getPendingProjects = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    try {
        const query = `
            SELECT
                *
            FROM projects
            WHERE project_state_fk = 1
            LIMIT 4
        `

        const [ results ] = await connection.promise().query(query)

        return res.json({
            message: 'successful request',
            data: results
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}


export const getLastMaterialsAdded = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    try {
        const query = "SELECT * FROM materials WHERE "
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}


export const getCountUsersRol = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    try {

    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}