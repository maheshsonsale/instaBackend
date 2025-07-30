import express from 'express'
import * as method from '../methods.js'
import AuthMiddleware from '../middlewares/AuthMiddleware.js'
let rout=express.Router()

rout.post('Auth',method.Auth) // registration
rout.post('create',method.registration) // registration
rout.post('login',method.login) // login
rout.post('createpost',AuthMiddleware,method.createpost)  // post create
rout.get('logout',method.logout)   // logout handler
rout.get('profile',AuthMiddleware,method.profile) //loading data for profle to see 
rout.get('allposts',AuthMiddleware,method.allposts)
rout.get('sideprofile',AuthMiddleware,method.sideprofile)
rout.put('likes',AuthMiddleware,method.likes)
rout.post('comments',AuthMiddleware,method.comments)
rout.post('deletepost',AuthMiddleware,method.deletepost)
rout.post('followers',AuthMiddleware,method.followers)
rout.post('following',AuthMiddleware,method.following)
rout.post('editPic',AuthMiddleware,method.editPic)
rout.post('search',AuthMiddleware,method.search)
rout.delete('deleteProfile',AuthMiddleware,method.deleteProfile)
rout.get('getUserDetail',AuthMiddleware,method.getUserDetail)
rout.patch('updateUserDetail',AuthMiddleware,method.updateUserDetail)    // 
rout.post('chatUser',AuthMiddleware,method.chatUser)    // 
rout.post('otherPerson',AuthMiddleware,method.otherPerson)


export default rout