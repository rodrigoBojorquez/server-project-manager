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
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()
        })
    }
    
    try {
        const { page, search } = req.query

        if (search != null) {
            const querySearch = "SELECT * FROM materials  WHERE material_name LIKE ? ORDER BY id_material DESC LIMIT 10 OFFSET ?"
            const searchTerm = `%${search}%`
            const [ results ] = await connection.promise().query(querySearch, [searchTerm, (page - 1) * 15])

            if (results.length == 0) {
                return res.json({
                    message: "there's no materials found"
                })
            }

            return res.json({
                message: "successful request",
                data: results
            })
        }
        else {
            // search the warehouse 15 by 15
            const queryPage = "SELECT * FROM materials LIMIT 15 OFFSET ?"
            const [ results ] = await connection.promise().query(queryPage, [(page - 1) * 15])

            if (results.length == 0) {
                return res.json({
                    message: "there's no materials found"
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

        // merge existing data with request body
        const updatedMaterial = {
            materialName: materialName || existingMaterial[0].material_name,
            quantity: quantity || existingMaterial[0].quantity,
            measure: measure || existingMaterial[0].measure
            // Add more fields if needed
        }

        // Update the material in the db
        const queryUpdate = 'UPDATE materials SET material_name = ?, quantity = ?, measure = ? WHERE id_material = ?';
        await connection.promise().query({
            sql: queryUpdate,
            values: [updatedMaterial.materialName, updatedMaterial.quantity, updatedMaterial.measure, id]
        })

        return res.json({
            message: 'material updated successfully',
            data: updatedMaterial
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
                error: "the provided id isn't valid"
            })
        }

        const idMaterial = material[0].id_material

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