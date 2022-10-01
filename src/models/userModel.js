const mongoose=require("mongoose")
const validator=require("validator")
const bcryptjs=require("bcryptjs")
const jwt=require("jsonwebtoken")

const userSchema=new mongoose.Schema({
    fullname:{
        type:String,
        required:true,   
    },
    role:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Not a valid email.")
            }
        }
    },
    password:{
        type:String,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    authtoken:{
        type:String
    },
    company:{
        type:String
    },
    resumeName:{
        type:String
    },
    resumePath:{
        type:String
    }
})

//password hashing
userSchema.pre("save", async function(next) { 
    if (this.isModified("password")) {
        this.password = await bcryptjs.hash(this.password, 10)
        next()
    }
})

//generating jwt
userSchema.methods.generateAutheticationToken = async function() {
    try {
        const _id=this.id
        const token = await jwt.sign(_id, process.env.SECRET_KEY) //1) is my unique identifier 2) is my secret key
        this.authtoken = token
        await this.save()
        return token
    } catch (error) {
        console.log(`ERROR occured: ${error}`);
    }
}



const userModel=new mongoose.model("User",userSchema)

module.exports=userModel