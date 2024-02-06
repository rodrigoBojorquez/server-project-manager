import connection from "../database.js";
import { validationResult } from "express-validator";

export const createTeam = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array(),
    });
  }

  try {
    const { teamName, projectId, leaderId, members } = req.body;

    // validate project
    const querySearchProject = "SELECT * FROM projects WHERE id_project = ?";
    const [project] = await connection
      .promise()
      .query({ sql: querySearchProject, values: projectId });

    if (project.length == 0) {
      return res.status(404).json({
        error: "project not found",
      });
    }

    const [projectWithTeam] = await connection
      .promise()
      .query("SELECT * FROM teams WHERE project_fk = ?", [projectId]);
    if (projectWithTeam.length > 0) {
      return res.status(403).json({
        error: "the project already has a team",
      });
    }

    // validate leader
    const queryValidateLeader = "SELECT * FROM users WHERE id_user = ?";
    const [resultLeader] = await connection
      .promise()
      .query(queryValidateLeader, [leaderId]);
    if (
      resultLeader[0] == undefined ||
      resultLeader[0].rol_fk != 2 ||
      resultLeader[0].team_fk != null
    ) {
      return res.status(403).json({
        error: "invalid leader",
      });
    }

    // validate the members
    const querySearchUsersId = "SELECT * FROM users WHERE id_user = ?";
    for (const id of members) {
      try {
        // user doesn't exist
        const [result] = await connection
          .promise()
          .query(querySearchUsersId, [id]);
        if (
          result[0] == undefined ||
          result[0].team_fk != null ||
          result[0].rol_fk != 3
        ) {
          throw new Error(`invalid user with id ${id}`);
        }
      } catch (err) {
        return res.status(403).json({
          error: err.message,
        });
      }
    }

    // insert the team
    const queryInsert =
      "INSERT INTO teams (team_name, project_fk) VALUES (?, ?)";
    const [response] = await connection
      .promise()
      .execute(queryInsert, [teamName, projectId]);

    // add the leader
    const queryLeader = "UPDATE users SET  team_fk = ? WHERE id_user = ?";
    await connection
      .promise()
      .query(queryLeader, [response.insertId, leaderId]);

    // add the member to the team
    for (const id of members) {
      const queryMember = `UPDATE users SET team_fk = ? WHERE id_user = ?`;
      await connection.promise().query(queryMember, [response.insertId, id]);
    }

    return res.json({
      message: "team added successfully",
      data: req.body,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getTeams = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array(),
    });
  }

  try {
    const { page, search } = req.query;

    if (search == null) {
      const querySearch = `
        SELECT
        main_team.id_team,
        main_team.team_name,
        (
            SELECT JSON_OBJECT(
                "id_project", projects.id_project,
                "project_name", projects.project_name,
                "num_members", COUNT(DISTINCT users.id_user)
            )
            FROM projects
            LEFT JOIN teams ON teams.project_fk = projects.id_project
            LEFT JOIN users ON teams.id_team = users.team_fk
            WHERE teams.id_team = main_team.id_team
            GROUP BY projects.id_project
            LIMIT 1
        ) AS project_info,
        leader_info.username AS leader_username,
        leader_info.id_user AS leader_id,
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    "id_user", team_members.id_user,
                    "username", team_members.username
                )
            )
            FROM users AS team_members
            WHERE team_members.team_fk = main_team.id_team AND team_members.rol_fk = 3
        ) AS team_members_info
        FROM
            teams AS main_team
        LEFT JOIN users AS leader_info ON main_team.id_team = leader_info.team_fk AND leader_info.rol_fk = 2
        LIMIT 10 OFFSET ?;  
            `;

      const [results] = await connection
        .promise()
        .query(querySearch, [(page - 1) * 10]);

      if (results.length == 0) {
        return res.json({
          message: "there's no projects found",
        });
      }

      return res.json({
        message: "successful request",
        data: results,
      });
    } else {
      const querySearch = `
            SELECT
                teams.id_team,
                teams.team_name,
                (
                    SELECT JSON_OBJECT(
                        "id_project", projects.id_project,
                        "project_name", projects.project_name,
                        "num_members", COUNT(users.id_user)
                    )
                    FROM teams
                    INNER JOIN projects ON teams.project_fk = projects.id_project
                    LEFT JOIN users ON teams.id_team = users.team_fk
                    WHERE teams.id_team = teams.id_team
                    GROUP BY projects.id_project
                ) AS project_info,
                leader_info.username AS leader_username,
                leader_info.id_user AS leader_id_user
            FROM
                teams
            LEFT JOIN users AS leader_info ON teams.id_team = leader_info.team_fk AND leader_info.rol_fk = 2
            WHERE
                team_name LIKE ?
            LIMIT 15 OFFSET ?
            `;

      const searchTerm = `%${search}%`;
      const [results] = await connection
        .promise()
        .query(querySearch, [searchTerm, (page - 1) * 15]);

      if (results.length == 0) {
        return res.json({
          message: "there's no teams found",
        });
      }

      return res.json({
        message: "successful request",
        data: results,
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array(),
      });
    }

    const { id } = req.params;

    const querySearch = `
            SELECT
                teams.id_team,
                teams.team_name,
                teams.project_fk,
                (
                    SELECT JSON_OBJECT (
                        "leader_id", users.id_user,
                        "leader_username", users.username
                    )
                    FROM users WHERE team_fk = teams.id_team AND rol_fk = 2
                    LIMIT 1
                ) AS leader_info,
                (
                    SELECT JSON_ARRAYAGG(
                        users.id_user
                    )
                    FROM users
                    WHERE users.team_fk = teams.id_team AND users.rol_fk = 3
                ) AS  members_list
            FROM teams
            WHERE teams.id_team = ?
        `;
    const [oldTeam] = await connection.promise().query(querySearch, [id]);
    // return res.json({mss: oldTeam[0]})

    if (!oldTeam[0]) {
      return res.status(404).json({
        error: "the team doesn't exist",
      });
    }

    const { teamName, projectId, leaderId, members } = req.body;

    // return res.json({
    //     meesage: "team updated successfully",
    //     data: oldTeam[0]
    // })
    const updatedTeam = {
      teamName: teamName || oldTeam[0].team_name,
      projectId: projectId || oldTeam[0].project_fk,
      leaderId: leaderId || oldTeam[0].leader_info,
      members: members || oldTeam[0].members_list,
    };
    

    if (oldTeam[0].leader_info != null) {
      // return res.json({fi: "no pasa"})
      if (
        updatedTeam.leaderId !==
        oldTeam[0].leader_info.leader_id
      ) {
        // validate leader
        const queryValidateLeader = "SELECT * FROM users WHERE id_user = ?";
        const [resultLeader] = await connection
          .promise()
          .query(queryValidateLeader, [leaderId]);
        if (
          resultLeader[0] == undefined ||
          resultLeader[0].rol_fk != 2 ||
          resultLeader[0].team_fk != null
        ) {
          return res.status(403).json({
            error: "invalid leader",
          });
        }

        // removing the old leader
        const queryLeader = "UPDATE users SET  team_fk = ? WHERE id_user = ?";
        await connection
          .promise()
          .query(queryLeader, [null, oldTeam[0].leader_info.leader_id]);

        // set the new leader
        await connection
          .promise()
          .query(queryLeader, [updatedTeam.projectId, updatedTeam.leaderId]);
      }
    }
    else {
      const queryLeader = "UPDATE users SET  team_fk = ? WHERE id_user = ?";
      await connection
      .promise()
      .query(queryLeader, [id, updatedTeam.leaderId]);
    }
    // return res.json({nd: "si pasa"})

    // validate the memebers is they changed
    if (updatedTeam.members !== oldTeam[0].members_list) {

      const queryUpdateMember =
        "UPDATE users SET team_fk  = ? WHERE id_user = ?";
      if (oldTeam[0].members_list !== null) {
        for (const id of oldTeam[0].members_list) {
          // remove the old members
          await connection.promise().query(queryUpdateMember, [null, id]);
        }
      }
      for (const idMember of updatedTeam.members) {
        // add the new members to the team
        await connection
          .promise()
          .query(queryUpdateMember, [id, parseInt(idMember)]);
      }
    }

    // udpate the team fields
    const queryUpdateTeam =
      "UPDATE teams SET team_name = ?, project_fk = ? WHERE id_team = ?";
    const [response] = await connection
      .promise()
      .execute(queryUpdateTeam, [
        updatedTeam.teamName,
        updatedTeam.projectId,
        id,
      ]);

    return res.json({
      message: "the team was successfully modified",
      data: response,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const deleteTeam = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array(),
    });
  }

  try {
    const { id } = req.params;

    // validate team
    const querySearch = "SELECT * FROM  teams WHERE id_team = ?";
    const [response] = await connection.promise().query(querySearch, [id]);

    if (!response[0]) {
      return res.status(404).json({
        error: `The team with the ID ${id}, does not exist`,
      });
    }

    const queryDeleteFk = "UPDATE users SET team_fk = NULL WHERE  team_fk = ?";
    const queryDeleteTeam = "DELETE FROM teams WHERE id_team = ?";

    await connection.promise().query(queryDeleteFk, [id]);
    await connection.promise().query(queryDeleteTeam, [id]);

    return res.json({
      message: "team  deleted successfuly",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
