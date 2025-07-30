import mongoose from "mongoose";

let postsch = mongoose.Schema({
    content: {type: String},
    image: {type: String},
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:'userDetail'}],
    commentids:[{type:mongoose.Schema.Types.ObjectId,ref:'comments'}],
    userid:{type:mongoose.Schema.Types.ObjectId,ref:'userDetail'},
},{timestamps:true})

const PostModel=mongoose.model('posts',postsch)
export default PostModel