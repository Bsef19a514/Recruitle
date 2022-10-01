const mongoose = require("mongoose")


const db= process.env.DB
//const localDB="mongodb://localhost:27017/Recruitle"
mongoose.connect(db)
    .then(() => {
        console.log("connection successful");
    })
    .catch((err) => {
        console.log(`Error occured: ${err}`);
    })

module.exports=db