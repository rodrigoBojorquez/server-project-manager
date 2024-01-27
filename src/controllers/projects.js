import connection from "../database.js"
import { validationResult } from "express-validator"

export const createProject = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    try {
        const { projectName, projectDescription } = req.body
        const queryInsert = "INSERT INTO projects (project_name, project_description, create_date, project_state_fk) VALUES (?, ?, NOW(), ?)"
        const [ result ] = await connection.promise().query({sql: queryInsert, values: [projectName, projectDescription, 1]})

        return res.json({
            message: "team added successfully",
            data: result
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}