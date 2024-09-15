const express = require("express");
const jwt = require("jsonwebtoken")
const JWT_SECRET = "randomthing";
const bcrypt = require('bcrypt');
const { UserModel, TodoModel } = require("./db");
const { default: mongoose } = require("mongoose");

mongoose.connect("mongodb://localhost:27017/crud")
const app = express();

app.use(express.json());

app.post("/signup", async function(req,res){
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hashedPassword = await bcrypt.hash(password,10);

    await UserModel.create({
        email: email,
        password:hashedPassword,
        name:name
    })
    res.json({
        msg: "you have logged in"
    })
})

app.post("/signin",async function (req,res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email:email,
        password:password
    })

    if (user) {
        const token = jwt.sign({
            id:user._id.toString(),
        },JWT_SECRET);
        res.json({
            token:token
        });
    } else {
        res.status(403).json({
            message: "Unauthorised User"
        })
    }
})

function auth(req,res,next){
    const token  = req.headers.token;

    const decodedData = jwt.verify(token,JWT_SECRET);

    if(decodedData){
        req.userId = decodedData.id;
        next();
    } else {
        res.status(401).json({
            message:"unautorised access"
        })
    }

}

app.listen(8000)