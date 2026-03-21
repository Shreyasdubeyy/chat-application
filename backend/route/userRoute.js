import express from "express"
import isLogin from "../middleware/isLogin.js";
import { deleteUserAccount, getCurrentChatters, getUserBySearch, getUserProfile, updateUserProfile, uploadProfilePicture, getPublicUserProfile } from "../routeControllers/userhandlerController.js";
import { blockUser, checkBlockStatus, unblockUser } from "../routeControllers/blockUnblockController.js";
import upload from "../middleware/upload.js";

const router=express.Router();

router.get("/search",isLogin,getUserBySearch)
router.get("/currentChatters",isLogin,getCurrentChatters)
router.get("/view/:userId", isLogin, getPublicUserProfile)

// Block User Route
router.post('/block',isLogin, blockUser);
router.get('/checkBlockStatus/:userId',isLogin, checkBlockStatus);
router.post('/unblock',isLogin, unblockUser);

// Profile routes
router.put("/profile", isLogin, updateUserProfile);
router.post("/profile/upload", isLogin, upload.single('profilePicture'), uploadProfilePicture);
router.get("/profile", isLogin, getUserProfile);
router.delete("/profile", isLogin, deleteUserAccount)

export default router;