const mongoose=require("mongoose")
const validator=require("validator")
const bcryptjs=require("bcryptjs")
const jwt=require("jsonwebtoken")

const schema=mongoose.Schema
const jobSchema=new mongoose.Schema({
    jobTitle:{
        type:String,
        required:true,   
    },
    location:{
        type:String,
        required:true
    },
    positions:{
        type:Number,
        required:true,
    },
    salary:{
        type:String,
        required:true,
        min:1
    },
    description:{
        type:String,
        default:false
    },
    createdAt:{
        type:String,
        required:true
    },
    company:{
        type:String
    },
    employerId:{
        type:schema.Types.ObjectId,
        required:true
    },
    employerName:{
        type:String,
        required:true
    },
    applicants:[
        {
            applicantId:{
                type:String,
                required:true
            },
            applicantName:{
                type:String,
                required:true
            },
            applicantEmail:{
                type:String,
                required:true
            },
            applicantResume:{
                type:String,
                required:true
            }
        }
    ]
})


const jobModel=new mongoose.model("Job",jobSchema)

module.exports=jobModel