export const assignPermissions = (roles) => (req, res, next) => {
    try {
      const rol = req.role.role_name;
      // Use the roles array here
      if (roles.includes(rol)) {
        // Role is allowed, proceed
        next();
      } else {
        // Role is not allowed, handle unauthorized access
        res.status(403).send("Unauthorized");
      }
    } catch (error) {
      // Handle errors
    }
  };