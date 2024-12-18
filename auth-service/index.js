const express = require('express');
const mongoose = require('mongoose');
const User = require("./model/user.js");
const jwt = require("jsonwebtoken")

const app = express();
const port = process.env.PORT || 7070;
app.use(express.json());
app.use(express.json());


// Connect to MongoDB
mongoose.connect("mongodb://localhost/auth-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connected to auth service database");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });

app.post("/auth/login", async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: "user does not exist" });
    }
    else {
        if (password !== user.password) {
            return res.json({ message: "password is not match" });
        }
        const payload = {
            email,
            name: user.name
        }
        jwt.sign(payload, "secret", (err, token) => {
            if (err) {
                console.log(err);
            }
            else {
                return res.json({ token: token });
            }
        })
    }
})

app.post("/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist) {
        return res.json({ message: "user already exist" });
    }
    else {
        const newUser = new User({
            name, email, password
        })
        newUser.save();
        return res.json(newUser);
    }
})


// Start the server
app.listen(port, () => {
    console.log(`Auth-service running on port ${port}`);
});
