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

CREATE TABLE projects(
	id_project INT PRIMARY KEY AUTO_INCREMENT,
    project_name VARCHAR(255) NOT NULL,
    project_description VARCHAR(1000) NOT NULL,
    create_date DATETIME NOT NULL,
    
    project_state_fk INT NOT NULL,
    FOREIGN KEY (project_state_fk) REFERENCES project_states(id_project_state)
);

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