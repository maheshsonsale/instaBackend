import mongoose from "mongoose";

let commentSch = mongoose.Schema({
    postid: {type: mongoose.Schema.Types.ObjectId,ref: 'posts'},
    userid: {type: mongoose.Schema.Types.ObjectId,ref: 'userDetail'},
    sender: {type: mongoose.Schema.Types.ObjectId,ref: 'userDetail'},
    comments: {type: String},
},{timestamps: true});

const CommentModel = mongoose.model('comments', commentSch)
export default CommentModel