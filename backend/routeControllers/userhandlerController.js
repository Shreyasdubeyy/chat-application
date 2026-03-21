import Conversation from "../Models/conversationModel.js";
import User from "../Models/userModels.js"
import cloudinary from "../utils/cloudinary.js";

export const getUserBySearch=async(req,res)=>{
    try {
        const search=req.query.search || "";
        const currentUserID=req.user._id;
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const user= await User.find({
           $and:[
            {
                $or:[
                    {username:{$regex:".*"+escapedSearch+".*",$options:"i"}},
                    {fullname:{$regex:".*"+escapedSearch+".*",$options:"i"}}
                ]
            },{
                _id:{$ne:currentUserID}
            }
           ]
        }).select("-password").select("email") 

        res.status(200).send(user)
    } catch (error) {
        res.status(500).send({success:false,message:error})
        console.log(error); 
    }
}

export const getCurrentChatters = async (req, res) => {
    try {
        const currentUserID = req.user?._id;

        if (!currentUserID) {
            return res.status(400).send({ success: false, message: "User not authenticated" });
        }

        const currentChatters = await Conversation.find({
            participants: currentUserID
        }).sort({ updatedAt: -1 });

        if (!currentChatters || currentChatters.length === 0) {
            return res.status(200).send([]);
        }

        const participantsIDs = currentChatters.flatMap((conversation) => 
            conversation.participants.filter((id) => id.toString() !== currentUserID.toString())
        );

        const uniqueParticipantIDs = [...new Set(participantsIDs)];

        const users = await User.find({ _id: { $in: uniqueParticipantIDs } }).select(
            "fullname username profilepic"
        );

        res.status(200).send(users);
    } catch (error) {
        console.error("Error in getCurrentChatters:", error);
        res.status(500).send({ success: false, message: "An error occurred while fetching chat participants." });
    }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ success: false, message: 'No file uploaded' });
        }

        const user = req.user;

        // Upload to Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: 'linkup/profiles',
            resource_type: 'auto'
        });

        // Update user profile picture
        user.profilepic = uploadResult.secure_url;
        await user.save();

        res.status(200).send({
            success: true,
            message: 'Profile picture updated successfully',
            profilepic: uploadResult.secure_url
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).send({ success: false, message: 'Error uploading profile picture' });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { fullname, username, email, gender, about } = req.body;
        const user = req.user; 

        user.fullname = fullname || user.fullname;
        user.username = username || user.username;
        user.email = email || user.email;
        user.gender = gender || user.gender;
        if (about !== undefined) user.about = about;

        await user.save();

        res.status(200).send({
            success: true,
            message: 'Profile updated successfully',
            user,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: 'Error updating profile' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = req.user; 

        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }

        res.status(200).send({
            success: true,
            user: {
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                gender: user.gender,
                profilepic: user.profilepic,
                about: user.about,
                createdAt: user.createdAt
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error fetching user profile' });
    }
};

export const getPublicUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password -email');

        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }

        res.status(200).send({
            success: true,
            user: {
                _id: user._id,
                fullname: user.fullname,
                username: user.username,
                gender: user.gender,
                profilepic: user.profilepic,
                about: user.about,
                createdAt: user.createdAt
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error fetching user profile' });
    }
};

export const deleteUserAccount = async (req, res) => {
    try {
        const user = req.user; 

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        await Conversation.deleteMany({ participants: user._id });
        await User.findByIdAndDelete(user._id);

        res.status(200).send({
            success: true,
            message: "User account and associated data deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting user account:", error);
        res.status(500).send({
            success: false,
            message: "An error occurred while deleting the account.",
        });
    }
};
