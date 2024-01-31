import connection from "../database.js"
import { validationResult } from "express-validator"


// * Create project
export const createProject = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    try {
        const { projectName, projectDescription, materials } = req.body

        const querySearch = "SELECT * FROM projects WHERE project_name = ?"
        const [ project ] =  await connection.promise().query({sql: querySearch, values: [projectName]})
        if (project.length != 0) {
            return res.status(400).json({
                error: "a project with that name already exists"
            })
        }

        const queryInsert = "INSERT INTO projects (project_name, project_description, create_date, project_state_fk) VALUES (?, ?, NOW(), ?)"
        const [ result ] = await connection.promise().query({sql: queryInsert, values: [projectName, projectDescription, 1]})

        // validate if the materials quantity is valid
        if (materials != null) {
            const querySearch = `
            SELECT
                m.id_material,
                m.material_name,
                m.quantity AS available_quantity,
                COALESCE(SUM(pm.quantity), 0) AS quantity_in_projects
            FROM
                materials m
            LEFT JOIN
                project_materials pm ON m.id_material = pm.material_fk
                        AND pm.material_fk = ?
            WHERE
                m.id_material = ?
            GROUP BY
                m.id_material, m.material_name, m.quantity;
            `

            const queryInsertMaterials = `
                INSERT INTO project_materials 
                (quantity, project_fk, material_fk)
                VALUES 
                (?, ?, ?)
            `

            let formattedMaterialsSum = []

            for (const material of materials) {
                const [ results ] = await connection.promise().query(querySearch, [parseInt(material.id), parseInt(material.id)])

                let formatedObj = {
                    id: parseInt(material.id),
                    material_name: results.length > 0 ? results[0].material_name : null,
                    material_quantity: results.length > 0 ? results[0].available_quantity : null,
                    total_used: results.length > 0 ? results[0].quantity_in_projects : 0,
                    to_add: material.quantity
                }

                if (( formatedObj.total_used + formatedObj.to_add ) >  formatedObj.material_quantity) {
                    return res.status(400).json({
                        error: "material limit exceeded",
                        sum: formatedObj.total_used + formatedObj.to_add,
                        queda: formatedObj.material_quantity,
                        res: results
                    })
                }
                
                // add the results to the arr
                formattedMaterialsSum.push(formatedObj)
                const insertedId = result.insertId
                const [ setMaterial ] = await connection.promise().query(queryInsertMaterials, [formatedObj.to_add, insertedId, formatedObj.id])
            }
        }

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

// * Get project
export const getProjects = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    try {
        const { page, search } = req.query

        if (search != null) {
            const querySearch = `
            SELECT 
                projects.id_project, 
                projects.project_name, 
                project_states.state_name, 
                projects.create_date,
                users.id_user,
                users.username,
                users.email,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id_project_material', project_materials.id_project_material,
                            'quantity', project_materials.quantity,
                            'material_name', materials.material_name
                        )
                    )
                    FROM project_materials
                    INNER JOIN materials ON project_materials.material_fk = materials.id_material
                    WHERE project_materials.project_fk = projects.id_project
                ) AS assigned_materials
            FROM 
                projects 
                INNER JOIN project_states ON projects.project_state_fk = project_states.id_project_state
                LEFT JOIN users ON projects.id_project = users.team_fk AND users.rol_fk = 2
            WHERE 
                project_name LIKE ? 
            ORDER BY 
                projects.id_project DESC 
            LIMIT 10 OFFSET ?
            `
            const searchTerm = `%${search}%`
            const [ results ] = await connection.promise().query(querySearch, [searchTerm, (page - 1) * 15])

            if (results.length == 0) {
                return res.json({
                    message: "there's no projects found"
                })
            }

            return res.json({
                message: "successful request",
                data: results
            })
        }
        else {
            // search the projects 15 by 15
            const queryPage = `
            SELECT 
                projects.id_project, 
                projects.project_name, 
                project_states.state_name, 
                projects.create_date,
                users.id_user AS id_leader,
                users.username AS leader_username,
                users.email AS leader_email,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id_project_material', project_materials.id_project_material,
                            'quantity', project_materials.quantity,
                            'material_name', materials.material_name
                        )
                    )
                    FROM project_materials
                    INNER JOIN materials ON project_materials.material_fk = materials.id_material
                    WHERE project_materials.project_fk = projects.id_project
                ) AS assigned_materials
            FROM 
                projects 
                INNER JOIN project_states ON projects.project_state_fk = project_states.id_project_state
                LEFT JOIN users ON projects.id_project = users.team_fk AND users.rol_fk = 2
            LIMIT 10 OFFSET ?`
            const [ results ] = await connection.promise().query(queryPage, [(page - 1) * 15])

            if (results.length == 0) {
                return res.json({
                    message: "there's no projects found"
                })
            }

            return res.json({
                message: "successful request",
                data: results
            })
        }
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

// TODO: Terminar dos enpoints

// export const updateProject = async (req, res) => {
//     const errors = validationResult(req)

//     if(!errors.isEmpty()) {
//         return res.status(400).json({
//             error: errors.array()
//         })
//     }
//     const {id_project,project_name, project_description, project_state_fk, materials} = req.body;

//     try {

//         const updateFields = [
//             ...(project_name !== undefined ? ['project_name = ?'] : []),
//             ...(project_description !== undefined ? ['project_description = ?'] : []),
//             ...(project_state_fk !== undefined ? ['project_state_fk = ?'] : []),
//             ...(materials !== undefined ? ['materials = ?'] : []),
//         ];
//         const updateParams = [
//             ...(project_name !== undefined ? [project_name]: []),
//             ...(project_description !== undefined ? [project_description]: []),
//             ...(project_state_fk !== undefined ? [project_state_fk]: []),
//             ...(materials !== undefined ? [materials]: []),
//             id_project
//         ];

//         const queryUpdateProject = `UPDATE projects SET ${updateFields.join(', ')} WHERE id_project = ?`;
//         const [updatedProject] = await connection.promise().query(queryUpdateProject, updateParams);
        
        
//         return res.status(200).json({message: `Project updated successfully. Rows affected ${updatedProject.affectedRows}`});
        
//     }
//     catch (err) {
//         return res.status(500).json({
//             error: err.message
//         })
//     }
// }
// export const updateProject = async (req, res) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//         return res.status(400).json({
//             error: errors.array()
//         });
//     }

//     const { id_project, project_name, project_description, project_state_fk, materials } = req.body;

//     try {
//         const updateFields = [];
//         const updateParams = [];

//         if (project_name !== undefined) {
//             updateFields.push('project_name = ?');
//             updateParams.push(project_name);
//         }

//         if (project_description !== undefined) {
//             updateFields.push('project_description = ?');
//             updateParams.push(project_description);
//         }

//         if (project_state_fk !== undefined) {
//             updateFields.push('project_state_fk = ?');
//             updateParams.push(project_state_fk);
//         }

//         // No estoy seguro de cómo planeas manejar el campo 'materials' en la base de datos.
//         // Asumiré que hay una relación con una tabla de materiales y que actualizarás eso de alguna manera.
//         // Si hay algún ajuste específico que necesitas aquí, por favor, házmelo saber.

//         // Actualizar la tabla 'projects'
//         const queryUpdateProject = `UPDATE projects SET ${updateFields.join(', ')} WHERE id_project = ?`;
//         const [updatedProject] = await connection.promise().query(queryUpdateProject, [...updateParams, id_project]);

//         // Actualizar la tabla 'project_materials' y 'materials'
//         if (materials !== undefined) {
//             for (const material of materials) {
//                 const { id_material, quantity } = material;

//                 const queryUpdateMaterials = `
//                     UPDATE project_materials SET quantity = ? WHERE project_fk = ? AND material_fk = ?;

//                     UPDATE materials SET quantity = ? WHERE id_material = ?;
//                 `;

//                 await connection.promise().query(queryUpdateMaterials, [quantity, id_project, id_material, quantity, id_material]);
//             }
//         }

//         return res.status(200).json({
//             message: `Project updated successfully. Rows affected: ${updatedProject.affectedRows}`
//         });

//     } catch (err) {
//         return res.status(500).json({
//             error: err.message
//         });
//     }
// };

export const updateProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        });
    }

    const { id_project, project_name, project_description, project_state_fk, materials } = req.body;

    try {
        const updateFields = [];
        const updateParams = [];

        if (project_name !== undefined) {
            updateFields.push('project_name = ?');
            updateParams.push(project_name);
        }

        if (project_description !== undefined) {
            updateFields.push('project_description = ?');
            updateParams.push(project_description);
        }

        if (project_state_fk !== undefined) {
            updateFields.push('project_state_fk = ?');
            updateParams.push(project_state_fk);
        }

        // Actualizar la tabla 'projects'
        const queryUpdateProject = `UPDATE projects SET ${updateFields.join(', ')} WHERE id_project = ?`;
        const [updatedProject] = await connection.promise().query(queryUpdateProject, [...updateParams, id_project]);

        // Actualizar la tabla 'project_materials'
        if (materials && materials.length > 0) {
            const updateMaterialsQueries = materials.map(material => ({
                query: 'UPDATE project_materials SET quantity = ? WHERE project_fk = ? AND material_fk = ?',
                values: [material.quantity, id_project, material.id_material]
            }));

            for (const updateQuery of updateMaterialsQueries) {
                await connection.promise().query(updateQuery.query, updateQuery.values);
            }
        }

        return res.status(200).json({
            message: `Project updated successfully. Rows affected: ${updatedProject.affectedRows}`
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};



export const deleteProject = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }
    const { id_project } = req.body;

try {
    const queryDelete = 'DELETE FROM projects WHERE id_project = ?';
    const [deleted] = await connection.promise().query(queryDelete, [id_project]);

    return res.status(200).json({ message: `Project deleted successfully. Rows affected: ${deleted.affectedRows}` });
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
}

}