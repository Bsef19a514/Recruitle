const express=require("express")
const userModel=require("../models/userModel")
const tokenModel=require("../models/tokenModel")
const jobModel=require("../models/jobModel")
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")
const router=new express.Router()
const bcryptjs=require("bcryptjs")
const jwt=require("jsonwebtoken")
const authentication=require("../middleware/userAuthentication")
const fileUploader=require("../middleware/fileUploadMiddleware")
const moment=require("moment")

router.get("/",(req,res)=>{
    const error=req.query.error
    res.render("login",{error})
})

router.get("/signup", (req,res)=>{
    
    const error=req.query.error
    res.render("signup",{error})
})

router.post("/signup",async(req,res)=>{
    const {fullname,email,role,password,cPassword}=req.body
    
    if(password!=cPassword){
        res.redirect("/signup?error=Passwords do not match")
    }else{
       const result1=await userModel.findOne({email})
       if(result1){
            res.redirect("/signup?error=This email is already in use")
       }else{
            const user=new userModel({
                fullname,
                role,
                email,
                password
            })
            const result2=await user.save()
            const token = new tokenModel({
                userId: result2._id,
                token: crypto.randomBytes(32).toString("hex")
            })
            const result3=await token.save()
            const url = `${process.env.BASE_URL}users/${result2._id}/verify/${result3.token}`
            // console.log(url);
            const send=await sendEmail(email, "Verify your Account", url)
                res.redirect("/verify?status=true")   
       }
    }
})
router.get("/verify",(req,res)=>{
        const status=req.query.status
        if(status){
            res.render("verify")
        }else{
            res.clearCookie("jwt")
            res.redirect("/login?error=Unauthorized access.")
        }
          
})

router.get("/logout",(req,res)=>{
        res.clearCookie("jwt")
        res.redirect("/login")   
})

router.get("/users/:id/verify/:token",async(req,res)=>{
    const _id= req.params.id
    const token=req.params.token
    const result=await tokenModel.findOneAndDelete({
        userId:_id,
        token
    })
    if(result){
        const result2=await userModel.updateOne({_id},{verified:true})
        if(result2){
            res.redirect("/login")
        }
    }else{
        res.send("url has expired")
    }
})

router.get("/login",(req,res)=>{
    const error=req.query.error
    res.render("login",{error})
})

router.post("/login",async(req,res)=>{
    const {email,password}=req.body
    const result=await userModel.findOne({email})
    if(!result){
       
        const error="Email not found."
        res.redirect(`/login?error=${error}`)
    // if email founds
    }else{
        // if account is verified
        if(result.verified){
            const hashPassword=result.password
            const isMatched=await bcryptjs.compare(password,hashPassword)
            // if password is correct
            if(isMatched){
                const authToken=await result.generateAutheticationToken()
                res.cookie("jwt",authToken,
                {
                    expires:new Date(Date.now()+3000000), //expires tokes after 5 min
                    httpOnly:true
                })
                res.redirect("/home")  
            // res.render("home",{role:result.role})
            }else{
                const error="Password Incorrect."
                res.redirect(`/login?error=${error}`)
            }
        }else{
            // if account is not verified
            const token1 = await tokenModel.findOne({ userId: result._id })
            if (token1) {
                const error="Please verify your email first."
                res.redirect(`/login?error=${error}`)
            }else{
                const token2 = new tokenModel({
                    userId: result._id,
                    token: crypto.randomBytes(32).toString("hex")
                })
                const result2=await token2.save()
                const url = `${process.env.BASE_URL}users/${result._id}/verify/${result2.token}`
                await sendEmail(email, "Verify your Account", url)
                const error="Please verify your email first."
                res.redirect(`/login?error=${error}`)
            }
        }
    }
})

router.get("/home",authentication.userAuthentication,async(req,res)=>{
    const user=req.user
    const result= await jobModel.find({}).sort({$natural:-1}); //.sort() to return result in desending order
  
    const obj={
        user,
        result:result
    }
    const msg=req.query.application_msg
    obj.msg=msg
    res.render("home",obj)
})
router.get("/myJobs",authentication.employerAuthentication,async(req,res)=>{
    const user=req.user
    const result= await jobModel.find({employerId:user._id}).sort({$natural:-1});
    const obj={
        user,
        result:result
    }
    res.render("myJobs",obj)
})

router.get("/createNewJob",authentication.employerAuthentication,async(req,res)=>{
    const user=req.user
    const error=req.query.error
    console.log("Error: "+error);
    user.error=error
    res.render("create new job",user)
})

router.post("/createNewJob",authentication.employerAuthentication,async(req,res)=>{
    try{
        const user=req.user
        const {_id:employerId, company, fullname:employerName }=user
        const {jobTitle,salary,location,positions,description}=req.body
        
        //converting description text to sentence case
        
        var n=description.split(".");
        var sentenceCaseDesc=""
        for(i=0;i<n.length;i++)
        {
        var spaceput=""
        var spaceCount=n[i].replace(/^(\s*).*$/,"$1").length;
        n[i]=n[i].replace(/^\s+/,"");
        var newstring=n[i].charAt(n[i]).toUpperCase() + n[i].slice(1);
        for(j=0;j<spaceCount;j++)
        spaceput=spaceput+" ";
        sentenceCaseDesc=sentenceCaseDesc+spaceput+newstring+".";
        }
        sentenceCaseDesc=sentenceCaseDesc.substring(0, sentenceCaseDesc.length - 1);
        
        const date=new Date()
        const dateformat = moment(date, 'DD/MM/YYYY').format('MM/DD/YYYY');
        const dateString=dateformat.toString()
        const job=new jobModel({
            jobTitle:jobTitle.toLowerCase(),
            location:location.toLowerCase(),
            positions,
            salary,
            description:sentenceCaseDesc,
            company:company.toLowerCase(),
            employerId,
            createdAt:dateString,
            employerName:employerName.toLowerCase()
        })
        const result=await job.save()
        res.redirect("/home?msg=job posted successfully")
    }catch(error){
        res.redirect("/profile?error=Complete your profile first")
    }
    
})

router.get("/profile",authentication.employerAuthentication,async(req,res)=>{
    const user=req.user
    const error=req.query.error
    user.error=error
    res.render("employerProfile",user)

})

router.get("/userProfile",authentication.userAuthentication,async(req,res)=>{
    const user=req.user
    const error=req.query.error
    user.error=error
    if(user.role=="Applicant"){
        res.render("applicantProfile",user)
    }else{
        res.clearCookie("jwt")
        res.redirect("/login?error=Unauthorized access.")
    }
})

router.post("/userProfile",fileUploader,authentication.userAuthentication,async(req,res)=>{
    const user=req.user
        let {fullname,email}=req.body
        email=email.trim()
        if(user.email===email){
            try{
                if(req.file){
                    const result=await userModel.findByIdAndUpdate(user._id,{
                        fullname,
                        resumeName:req.file.originalname,
                        resumePath: req.file.location
                    })
                }else{
                    const result=await userModel.findByIdAndUpdate(user._id,{
                        fullname
                    })
                }
                res.redirect("/home")
            }catch(err){
                res.redirect("/userProfile?error=An uxexpected error has occured")
            }
        }
        else{
            try{
                if(req.file){
                    const result=await userModel.findByIdAndUpdate(user._id,{
                        fullname,
                        email,
                        resumeName:req.file.originalname,
                        resumePath: req.file.location
                    })
                }else{
                        const result=await userModel.findByIdAndUpdate(user._id,{
                                fullname,
                                email
                        })
                }
                res.redirect("/home")
            }catch(err){
                 res.redirect("/userProfile?error=There is another account with this email")   
            }
        }
})

router.post("/profile",authentication.employerAuthentication,async(req,res)=>{

    const user=req.user
        let {fullname,email,company}=req.body
        email=email.trim()
        if(user.email===email){
            try{
                const result=await userModel.findByIdAndUpdate(user._id,{
                    fullname,
                    company
                })
                res.redirect("/home")
            }catch(err){
                res.redirect("/profile?error=An uxexpected error has occured")
            }
        }
        else{
            try{
                const result=await userModel.findByIdAndUpdate(user._id,{
                    fullname,
                    email,
                    company
                })
                res.redirect("/home")
            }catch(err){
                res.redirect("/profile?error=There is another account with this email")
               
            }
        }
})

router.get("/profile/changePassword",authentication.userAuthentication,async(req,res)=>{
    const user=req.user
    const error=req.query.error
    user.error=error
    res.render("changePassword",user)
    
})
router.post("/profile/changePassword",authentication.userAuthentication,async(req,res)=>{
    const user=req.user
        let {currentPassword,newPassword,confirmPassword}=req.body
        
        if(confirmPassword===newPassword){
            const isMatched=bcryptjs.compare(currentPassword,user.password)
            if(isMatched){
                try{
                    const result=await userModel.findByIdAndUpdate(user._id,{newPassword})
                    res.redirect("/home")
                }catch(err){
                    res.redirect("/profile?error=An uxexpected error has occured")
                }
            }else{
                const error="Incorrect current Password"
                res.redirect(`/profile/changePassword?error=${error}`)
            }
        }else{
            const error="Passwords does not match"
            res.redirect(`/profile/changePassword?error=${error}`)
        }
        
})

router.get("/search",authentication.userAuthentication,async(req,res)=>{
    const user=req.user
    if(user.role=="Applicant"){
        const obj={
            user
        }
        res.render("search",obj)
    }else{
        res.clearCookie("jwt")
        res.redirect("/login?error=Unauthorized access.")
    }
})
router.post("/search",authentication.userAuthentication,async(req,res)=>{
    const user=req.user
    if(user.role=="Applicant"){
        const title_company=req.body.title_company.toLowerCase();
        const location=req.body.location.toLowerCase();
        let result
        if(title_company!="" && location!=""){
            result=await jobModel.find({
                $and:
                [{location:{$regex:'.*'+location+'.*'}},{$or:[{jobTitle:{$regex:'.*'+title_company+'.*'}},{company:{$regex:'.*'+title_company+'.*'}}]}]
            }).sort({$natural:-1});
        }else if(title_company==""){
            result=await jobModel.find({location:{$regex:'.*'+location+'.*'}}).sort({$natural:-1});
        }else{
            result=await jobModel.find({
                $or:[{jobTitle:{$regex:'.*'+title_company+'.*'}},{company:{$regex:'.*'+title_company+'.*'}}]
            }).sort({$natural:-1})
        }
        res.cookie("result",result,
                {
                    httpOnly:true
                })
        // res.redirect(`/search`)
        const obj={
            user,
            result
        }
        res.render("search",obj)
    }else{
        res.clearCookie("jwt")
        res.redirect("/login?error=Unauthorized access.")
    }
})
router.get("/apply/:jobId",authentication.userAuthentication,async(req,res)=>{
    const jobId= req.params.jobId
    const user=req.user
    if(user.resumePath){
        const applicant={
            applicantId:user._id,
            applicantName:user.fullname,
            applicantEmail:user.email,
            applicantResume:user.resumePath
        }
        try{
            const result=await jobModel.findByIdAndUpdate(jobId,
                {'$addToSet':
                    {
                        applicants:applicant
                    }}
            )
            res.redirect("/home?application_msg=Applied successfully")
        }catch(ex){
            console.log(ex);
        }
    }else{
        res.redirect("/userProfile?error=Please add your resume first")
    }
})

router.get("/jobs/:jobId/applications",authentication.userAuthentication,async(req,res)=>{
    const jobId= req.params.jobId
    try{
        const result= await jobModel.findOne({_id:jobId}).sort({$natural:-1});
        res.render("jobApplications",result)
    }catch(ex){
        console.log(ex);
    }
    


})
router.get("/*",async(req,res)=>{
    res.status(404)
    res.render("errorPage")
})
module.exports=router