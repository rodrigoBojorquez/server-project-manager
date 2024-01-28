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

        // validate project
        const querySearchProject = "SELECT * FROM projects WHERE id_project = ?"
        const [ project ] = await connection.promise().query({sql: querySearchProject, values: projectId})

        if (project.length == 0) {
            return res.status(404).json({
                error: "project not found"
            })
        }

        const [ projectWithTeam ] = await connection.promise().query("SELECT * FROM teams WHERE project_fk = ?", [projectId])
        if (projectWithTeam.length > 0) {
            return res.status(403).json({
                error:  "the project already has a team"
            })
        }

        // validate leader
        const queryValidateLeader = "SELECT * FROM users WHERE id_user = ?"
        const [ resultLeader ] = await connection.promise().query(queryValidateLeader, [leaderId])
        if (resultLeader[0] == undefined || resultLeader[0].rol_fk != 2 || resultLeader[0].team_fk != null ) {
            return res.status(403).json({
                error: "invalid leader"
            })
        }

        // validate the members
        const querySearchUsersId = "SELECT * FROM users WHERE id_user = ?"
        for (const id of members) {
            try {
                // user doesn't exist
                const [ result ] = await connection.promise().query(querySearchUsersId, [id])
                if (result[0] == undefined || result[0].team_fk != null || result[0].rol_fk != 3) {
                    throw new Error(`invalid user with id ${id}`)
                }
            }
            catch (err) {
                return res.status(403).json({
                    error: err.message
                })
            }
        }

        // insert the team
        const queryInsert = "INSERT INTO teams (team_name, project_fk) VALUES (?, ?)"
        const [ response ] =  await connection.promise().execute(queryInsert, [teamName, projectId])

        // add the leader
        const queryLeader = "UPDATE users SET  team_fk = ? WHERE id_user = ?"
        await connection.promise().query(queryLeader, [response.insertId, leaderId])

        // add the member to the team
        for (const id of members) {
            const queryMember = `UPDATE users SET team_fk = ? WHERE id_user = ?`
            await connection.promise().query(queryMember, [response.insertId, id])
        }

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