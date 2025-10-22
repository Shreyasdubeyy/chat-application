import express from "express"
import isLogin from "../middleware/isLogin.js";
import { deleteUserAccount, getCurrentChatters, getUserBySearch, getUserProfile, updateUserProfile } from "../routeControllers/userhandlerController.js";
import { blockUser, checkBlockStatus, unblockUser } from "../routeControllers/blockUnblockController.js";

const router=express.Router();

router.get("/search",isLogin,getUserBySearch)
router.get("/currentChatters",isLogin,getCurrentChatters)

// Block User Route
router.post('/block',isLogin, blockUser);
router.get('/checkBlockStatus',isLogin, checkBlockStatus); // Check if user is blocke
// Unblock User Route
router.post('/unblock',isLogin, unblockUser);



//profile
router.put("/profile", isLogin, updateUserProfile);
router.get("/profile", isLogin, getUserProfile);
router.delete("/profile", isLogin, deleteUserAccount)
export default router;