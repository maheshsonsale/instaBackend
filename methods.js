import UserModel from "./schemas/userSchema.js";
import PostModel from './schemas/postSchema.js';
import CommentModel from "./schemas/CommentSchema.js";
import connectDb from './config/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

connectDb()


//  Authentification for redirecting page to login or register
export const Auth = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ loggedIn: false })
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY)
        return res.status(200).json({ loggedIn: true })
    } catch (error) {
        return res.status(401).json({ loggedIn: false })
    }
}


// finding user profile === Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email })
        const hashPass = await bcrypt.compare(password, user.password)
        if (!user || !hashPass) {
            return res.status(404).send("")
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        res.status(200).send({ message: "Login successful", isLogin: true });
    } catch (error) {
        res.status(500).json({ messege: "Internal Server Error" });
    }
};


//creating user profile === registration
export const registration = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body
        const isAccount = await UserModel.findOne({ email: email })

        if (isAccount) {
            return res.status(200).json({ success: false })
        }
        const hashed = await bcrypt.hash(password, 10)
        const user = await UserModel.create({ fullname, username, email, password: hashed })
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        return res.status(201).json({ success: true })

    } catch (error) {
        console.log("userCreating Error", error);
    }
}



// creating user's post
export const createpost = async (req, res) => {
    try {
        const user = await UserModel.findById({ _id: req.user._id })
        const { content, image } = req.body;
        const newPost = await PostModel.create({ content: content, userid: user._id, image: image })
        user.postids.push(newPost._id)
        await user.save()
    } catch (error) {
        console.log(error);
    }
}


export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false, // only if using HTTPS
        sameSite: "None" // important for cross-origin requests (like frontend localhost:5173, backend:5000)
    });
    // console.log("User logged out");
    res.status(200).json({ message: "Logout successful" });
};



// loading profile data
export const profile = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.user._id }).sort({createdAt:-1}).populate('followers')
            .populate({
                path: 'postids',options: { sort: { createdAt: -1 } },  populate: [
                    { path: 'userid', model: 'userDetail' },
                    { path: 'commentids', model: 'comments', populate: { path: 'sender', model: 'userDetail' } }
                ]
            })
        res.send(user)
    } catch (e) {
        return e
    }
}
// show all post in feed 
export const allposts = async (req, res) => {
    try {
        const userid = req.user._id;
        const posts = await PostModel.find()
            .sort({ createdAt: -1 })
            .populate("userid").populate({ path: 'commentids', populate: { path: 'sender', model: 'userDetail' } });

        const modifiedPosts = posts.map((post) => {
            // const isLiked = post.likes.includes(userid);
            return {
                ...post.toObject(), // convert mongoose doc to plain object
                // likeunlike: isLiked ? "Unlike" : "Like",
                likeCount: post.likes.length,
            };
        });

        res.status(200).json({ modifiedPosts: modifiedPosts, userid: userid });
    } catch (error) {
        console.error("Like/Unlike logic error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// loading all comments in post
export const otherPerson = async (req, res) => {
    try {
        const existingUser = req.user._id;
        const { userid } = req.body;
        const user = await UserModel.findById(userid).populate({
            path: 'postids',options: { sort: { createdAt: -1 } },  populate: [
                { path: 'userid', model: 'userDetail' },
                { path: 'commentids', model: 'comments', populate: { path: 'sender', model: 'userDetail' } }
            ]
        })
        const isFollowing=user.followers.some(id=>id.toString()===existingUser.toString())
         const follUnfoll=isFollowing?"Unfollow":"Follow"
         
        res.status(200).json({ user: user, existingUser: existingUser,follUnfoll:follUnfoll})
    } catch (error) {
        res.status(500).send(error)
    }
}


export const sideprofile = async (req, res) => {
    const loggedInUserId = req.user._id.toString()
    const User = req.user;
    let allUser = await UserModel.find().populate('postids')
    const otherUsers = allUser.filter(user => user._id.toString() !== loggedInUserId).map((user) => {
        const isFollowing = user.followers.some(followerId => followerId.toString() === loggedInUserId)
        return {
            ...user.toObject(),
            follUnfoll: isFollowing ? "Unfollow" : "Follow",
        }
    })
    res.json({ User: User, otherUsers: otherUsers })
}


// LIkes section
export const likes = async (req, res) => {
    try {
        const user = await UserModel.findById({ _id: req.user._id })
        let { postid } = req.body
        let post = await PostModel.findById(postid)
        let alreadyLiked = post.likes.some(id => id.toString() === user._id.toString())
        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== user._id.toString())
            await post.save()
            return res.json({ liked: false })
        }
        post.likes.push(user._id)
        await post.save();
        return res.json({ liked: true })
    } catch (error) {
        console.log(error);
    }
}

// handling comment 
export const comments = async (req, res) => {
    try {
        const { postid, comments } = req.body;
        const post = await PostModel.findById(postid)
        const sender = await UserModel.findById({ _id: req.user._id });
        const comment = await CommentModel.create({ postid: postid, comments: comments, sender: sender._id })

        sender.commentids.push(comment._id)
        await sender.save()
        post.commentids.push(comment._id)
        await post.save()

    } catch (error) {
        console.log("Comment Error", error);
    }
}


// deleting post only admin
export const deletepost = async (req, res) => {
    const post = await PostModel.findById(req.body.postid)
    const user = await UserModel.findById(req.user._id)
    user.postids = user.postids.filter(id => id.toString() !== post._id.toString())
    await user.save()
    await post.deleteOne()
}

// followers handling
export const followers = async (req, res) => {
    try {
        const userid = req.user._id;
        const frontuserid = req.body.frontuserid;
        const frontuUser = await UserModel.findById(frontuserid)
        const isFollowing = frontuUser.followers.some(id => id.toString() === userid.toString())
        if (isFollowing) {
            frontuUser.followers = frontuUser.followers.filter(id => id.toString() !== userid.toString())
            await frontuUser.save()
            return res.json({ follow: false })
        }
        frontuUser.followers.push(userid)
        await frontuUser.save()
        return res.json({ follow: true })
    } catch (error) {
        console.log(error);

    }

}

// following handling
export const following = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id)

        const frontuserid = req.body.frontuserid;
        const isFollowing = user.following.some(id => id.toString() === frontuserid.toString());
        if (isFollowing) {
            user.following = user.following.filter(id => id.toString() !== frontuserid.toString());
            await user.save()
            return
        }
        user.following.push(frontuserid)
        await user.save()
    } catch (error) {
        console.log(error);
    }
}

// edit profile pic of user 
export const editPic = async (req, res) => {
    const { imageUrl } = req.body;
    await UserModel.updateOne({ _id: req.user._id }, { $set: { pic: imageUrl } })
}

// search box to find all users
export const search = async (req, res) => {
    try {
        const logUserId = req.user._id;
        const { search } = req.body;
        const users = await UserModel.find({
            $or: [{ username: { $regex: search, $options: 'i' } },
            { fullname: { $regex: search, $options: 'i' } }]
        }).select('-password')
        res.status(200).json({ users: users, logUserId: logUserId })
    } catch (error) {
        res.status(400).send(error)
    }
}
export const deleteProfile = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await UserModel.findById(req.user._id).populate('postids')
        if (password !== user.password) {
            return
        }
        await user.deleteOne()
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "None",
        })
        await PostModel.deleteMany({ _id: { $in: user.postids } })
        await CommentModel.deleteMany({ _id: { $in: user.commentids } })
        res.status(200).json({ delete: true })
    } catch (error) {
        res.status(500).send({ error: error, delete: false })
    }
}

// update profile section
export const getUserDetail = (req, res) => {
    res.send(req.user)
}

// updating   profile page
export const updateUserDetail = async (req, res) => {
    try {
        const userid = req.user._id;
        let user = await UserModel.updateOne({ _id: userid }, { $set: (req.body) })
        if (user.modifiedCount === 0) {
            return res.status(404).json({ message: "User not found or bio unchanged" });
        }
        res.status(200).json({ message: "Bio updated successfully", result: user });
    } catch (error) {
        res.status(500).json({ message: "server not responding" })
    }
}

export const chatUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).populate('following')
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error)
    }
}