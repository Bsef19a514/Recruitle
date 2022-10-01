const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")

const userAuthentication = async(req, res, next) => {
    try {

        const _id = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY) //verifying the jwt token obtained from cookies and getting user id
        // console.log(_id);
        const user= await userModel.findOne({_id}) //getting user details based on id
        // console.log("user is: ",user);
        //  console.log("user auth");
        if(user){
            req.user = user //attaching userdetails with req Object so that we can use those details in home page
            next()
        }
    } catch (err) {
        const error = "You are not logged in. Please login first."
        res.redirect(`/login?error=${error}`)
    }
}

const employerAuthentication = async(req, res, next) => {
    try {
        const _id = jwt.verify(req.cookies.jwt, process.env.SECRET_KEY) //verifying the jwt token obtained from cookies and getting user id
        const user= await userModel.findOne({_id}) //getting user details based on id
        // console.log("emploer auth");
        if(user){
            if(user.role=="Employer"){
                req.user = user //attaching userdetails with req Object so that we can use those details in home page
                next()
            }else{
                const error = "Unauthorized access."
                res.clearCookie("jwt")
                res.redirect(`/login?error=${error}`)
            }  
        }
    } catch (err) {
        const error = "You are not logged in. Please login first."
        res.redirect(`/login?error=${error}`)
    }
}


module.exports.employerAuthentication=employerAuthentication
module.exports.userAuthentication = userAuthentication