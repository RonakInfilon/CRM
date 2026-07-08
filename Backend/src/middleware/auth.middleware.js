const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  //fromtend will sent authheader like bearer xyz-123-456
  const authHeader = req.headers["authorization"];
  // it will sperate bearer and header and store header in token
  const token = authHeader && authHeader.split(" ")[1];
  //if token is undefined then it will sent stauts 401 and ask for token
  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }
  //it will verify the token by inbuilt method 
  jwt.verify(token, process.env.SecreatKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    //it will store user_id
    req.user = user;
    //if eveything is valid then it will move to next controller
    next();
  });
};

module.exports = authenticateToken;
