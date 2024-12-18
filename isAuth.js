const jwt = require("jsonwebtoken")

export async function isAuth(req, res, next){
    const token = req.headers["authorization"] .split(" ")[1];

    jwt.verify(token , "secret" , (err, token) => {
        if(err) {
            console.log(err)
            return res.json({err})
        }
        else{
            req.user = user;
            next();
        }
    })
}