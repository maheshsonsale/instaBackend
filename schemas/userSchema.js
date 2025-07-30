import mongoose from "mongoose";

let userSchema = mongoose.Schema({
    fullname: {type: String,required: true},
    username: {type: String,required: true,unique:true},
    email: {type: String,required: true,unique:true},
    mobile: {type: String},
    password: {type: String,required: true},
    bio: {type: String},
    pic: {type: String,default:'https://res.cloudinary.com/dzmmp468g/image/upload/v1752417251/uiqranfp8hlsqo1rqze3.jpg'},
    postids: [{type: mongoose.Schema.Types.ObjectId,ref:'posts'}],
    commentids: [{type: mongoose.Schema.Types.ObjectId,ref:'userDetail'}],
    followers: [{type: mongoose.Schema.Types.ObjectId,ref:'userDetail'}],
    following: [{type: mongoose.Schema.Types.ObjectId,ref:'userDetail'}],
    
},{timestamps:true});

const UserModel = mongoose.model('userDetail', userSchema)
export default UserModel