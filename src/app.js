
const express=require ("express")
const path=require ("path")
const hbs=require("hbs")
const env=require("dotenv").config()
require("./db/connection")
const router=require("./routers/router")

const app=express()

const staticPath= path.join(__dirname,"../public")
const viewPath=path.join(__dirname,"../templates/views")
const partialPath=path.join(__dirname,"../templates/partials")
const cookieParser=require("cookie-parser")

app.use(express.static(staticPath))
app.set("view engine","hbs")
app.set("views",viewPath)
hbs.registerPartials(partialPath)
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

hbs.registerHelper('ifCond', function(val1, val2, options) {
    if(val1 === val2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

app.use(router)

const port=process.env.PORT || 3000
app.listen(port,()=>{
    console.log("listening to port 3000");
})