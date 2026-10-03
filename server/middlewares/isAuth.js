const jwt = require("jsonwebtoken");

const isAuth = async (req, res, next) => {
 
  try {
    const token = req.cookies.token;
    
    //No token
    if (!token) {
      return res.status(401).json({
        message: "User does not have a token",
      });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verifyToken.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};

module.exports = isAuth;
