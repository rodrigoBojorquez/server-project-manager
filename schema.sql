-- Active: 1698940124006@@127.0.0.1@3306@project_manager

CREATE DATABASE project_manager;
USE project_manager;

CREATE TABLE rols(
	id_rol INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    rol_description VARCHAR(255),
    permissions JSON
);

INSERT INTO rols (title, rol_description) VALUES 
("administrator", "tiene acceso a todas las caracteristicas del sistema"),
("team leader", "puede gestionar las cargas de trabajo de los miembros de un equipo y cambiar el estado del proyecto"),
("employee", "puede visualizar su equipo y editar su informacion"),
("registrators", "solo puedo agregar trabajadores"),
("warehouse admin", "administra solo el almacen");

CREATE TABLE project_states(
	id_project_state INT PRIMARY KEY AUTO_INCREMENT,
    state_name VARCHAR(255) NOT NULL
);

INSERT INTO project_states (state_name) VALUES
("en curso"),
("terminado"),
("cancelado"),
("en pausa");

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

CREATE INDEX idx_project_name ON projects(project_name);

CREATE TABLE teams(
	id_team INT PRIMARY KEY AUTO_INCREMENT,
	team_name VARCHAR(255) NOT NULL,
    
    project_fk INT,
    FOREIGN KEY (project_fk) REFERENCES projects(id_project)
);

CREATE INDEX idx_team_name ON teams(team_name);

CREATE TABLE materials(
	id_material INT PRIMARY KEY AUTO_INCREMENT,
    material_name VARCHAR(255) NOT NULL UNIQUE,
    create_date DATETIME NOT NULL,
	update_date DATETIME,
    quantity FLOAT,
	measure VARCHAR(255)
);

CREATE INDEX  idx_material_name ON materials(material_name);

CREATE TABLE project_materials (
    id_project_material INT PRIMARY KEY AUTO_INCREMENT,
    quantity FLOAT,
    project_fk INT,
    material_fk INT,

    FOREIGN KEY (project_fk) REFERENCES projects(id_project),
    FOREIGN KEY (material_fk) REFERENCES materials(id_material)
);

CREATE TABLE users(
	id_user INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    speciality VARCHAR(255),
    workload VARCHAR(255),
    is_activate TINYINT NOT NULL,
    activation_token VARCHAR(100),
    
    rol_fk INT NOT NULL,
    FOREIGN KEY (rol_fk) REFERENCES rols(id_rol),
    
    team_fk INT,
    FOREIGN KEY (team_fk) REFERENCES teams(id_team)
);

CREATE INDEX idx_email ON users(email);




