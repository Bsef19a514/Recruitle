const mongoose = require("mongoose")
const Schema = mongoose.Schema
const tokenSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        default: Date.now(),
        expires: 3600
    }
})
const tokenModel = new mongoose.model("token", tokenSchema)
module.exports = tokenModel