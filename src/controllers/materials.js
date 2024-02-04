import connection from "../database.js"
import { validationResult } from "express-validator"


export const createMaterial = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    const { materialName, quantity, measure } = req.body

    try {
        // validate if the material already exist in the db
        const querySearch = "SELECT * FROM materials WHERE material_name = ?"
        const [ validation ] = await connection.promise().query(querySearch, [materialName])
        
        if(validation.length > 0){
            return res.status(400).json({
                error: "the material already exist"
            })
        }

        const queryInsert = "INSERT INTO materials (material_name, create_date, quantity, measure) VALUES (?, NOW(), ?, ?)"
        const [ response ] = await connection.promise().query({sql: queryInsert, values: [materialName, parseInt(quantity), measure]})
 
        return res.json({
            message: "material added successfully",
            data: response
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}


export const getMaterials = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        });
    }

    try {
        const { page, search } = req.query;

        if (search != null) {
            const querySearch =
                "SELECT m.*, " +
                "COALESCE(m.quantity - SUM(pm.quantity), m.quantity) AS available_quantity " +
                "FROM materials m " +
                "LEFT JOIN project_materials pm ON m.id_material = pm.material_fk " +
                "WHERE m.material_name LIKE ? " +
                "GROUP BY m.id_material " +
                "ORDER BY m.id_material DESC LIMIT 10 OFFSET ?";
            const searchTerm = `%${search}%`;
            const [results] = await connection.promise().query(querySearch, [searchTerm, (page - 1) * 15]);

            if (results.length == 0) {
                return res.json({
                    message: "There's no materials found"
                });
            }

            return res.json({
                message: "Successful request",
                data: results
            });
        } else {
            // Search the warehouse 15 by 15
            const queryPage =
                "SELECT m.*, " +
                "COALESCE(m.quantity - SUM(pm.quantity), m.quantity) AS available_quantity " +
                "FROM materials m " +
                "LEFT JOIN project_materials pm ON m.id_material = pm.material_fk " +
                "GROUP BY m.id_material " +
                "LIMIT 10 OFFSET ?";
            const [results] = await connection.promise().query(queryPage, [(page - 1) * 10]);

            if (results.length == 0) {
                return res.json({
                    message: "There's no materials found"
                });
            }

            return res.json({
                message: "Successful request",
                data: results
            });
        }
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};



export const updateMaterial = async (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    try {
        const { id } = req.params
        const { materialName, quantity, measure } = req.body

        // retrieve existing material data
        const querySearch = 'SELECT * FROM materials WHERE id_material = ?';
        const [existingMaterial] = await connection.promise().query({ sql: querySearch, values: [id] });

        if (existingMaterial.length === 0) {
            return res.status(404).json({
                error: 'material not found'
            })
        }

        const queryVerify = "SELECT SUM(quantity) AS total_used FROM project_materials WHERE material_fk = ?";

        const [ resultVerify ] =  await connection.promise().query(queryVerify, [id])

        if (resultVerify[0].total_used > quantity) {
            return res.status(400).json({
                error: `the amount of this material is insufficient for the requested operation`
            })
        }

        // merge existing data with request body
        const updatedMaterial = {
            materialName: materialName || existingMaterial[0].material_name,
            quantity: quantity || existingMaterial[0].quantity,
            measure: measure || existingMaterial[0].measure
        }

        // Update the material in the db
        const queryUpdate = 'UPDATE materials SET material_name = ?, quantity = ?, measure = ?, update_date = NOW() WHERE id_material = ?';
        const [ newMaterial ] = await connection.promise().query({
            sql: queryUpdate,
            values: [updatedMaterial.materialName, updatedMaterial.quantity, updatedMaterial.measure, id]
        })

        return res.json({
            message: 'material updated successfully',
            data: newMaterial
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}


export const deleteMaterial = async (req, res) => { 
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }

    try {
        const { id } = req.params

        // VALIDATE THE id
        const querySearch = "SELECT * FROM materials WHERE id_material = ?"
        const [ material ] = await connection.promise().query({sql: querySearch, values: [id]})
    
        if (material.length == 0) {
            return res.status(404).json({
                error: "any material matched with this id"
            })
        }

        const idMaterial = material[0].id_material

        const queryDeleteProject = "DELETE FROM project_materials WHERE material_fk = ?"
        await connection.promise().query(queryDeleteProject, [idMaterial])

        const queryDelete = "DELETE FROM materials WHERE id_material = ?"
        const [ response ] = await connection.promise().query({sql: queryDelete, values: [idMaterial]})
    
        return res.json({
            message: "the material has been deleted successfully",
            data: response
        })
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}