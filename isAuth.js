const jwt = require("jsonwebtoken");

function isAuth(req, res, next) {
    const authHeader = req.headers["authorization"];

    // Check if the authorization header exists
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token missing" });
    }

    // Verify the token
    jwt.verify(token, "secret", (err, decodedToken) => {
        if (err) {
            console.log(err);
            return res.status(403).json({ error: "Invalid token" });
        } else {
            req.user = decodedToken;
            next();
        }
    });
}

module.exports = isAuth;
