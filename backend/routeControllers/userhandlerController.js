import Conversation from "../Models/conversationModel.js";
import User from "../Models/userModels.js"




export const getUserBySearch=async(req,res)=>{
    try {
        const search=req.query.search || "";
        const currentUserID=req.user._id;

        // mongo db keys $ 
        const user= await User.find({
        //    mongo db query $and if 2 queries has to be used 
           $and:[
            {
                // $or for 2 parameters username or fullname
                $or:[
                    {username:{$regex:".*"+search+".*",$options:"i"}},
                    {fullname:{$regex:".*"+search+".*",$options:"i"}}
                    // $options for case insenstive
                ]
            },{
                // to not show self id 
                _id:{$ne:currentUserID}
            }
           ]
        }).select("-password").select("email") 
        // send everything except password and email 

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

        // Fetch conversations involving the current user
        const currentChatters = await Conversation.find({
            participants: currentUserID
        }).sort({ updatedAt: -1 });

        if (!currentChatters || currentChatters.length === 0) {
            return res.status(200).send([]);
        }

        // Extract participant IDs excluding the current user
        const participantsIDs = currentChatters.flatMap((conversation) => 
            conversation.participants.filter((id) => id.toString() !== currentUserID.toString())
        );

        // Debugging output
        // console.log("Participants IDs:", participantsIDs);

        // Remove duplicates using a Set
        const uniqueParticipantIDs = [...new Set(participantsIDs)];

        // Fetch users corresponding to participant IDs
        const users = await User.find({ _id: { $in: uniqueParticipantIDs } }).select(
            "fullname username profilepic"
        );

        res.status(200).send(users);
    } catch (error) {
        console.error("Error in getCurrentChatters:", error);
        res.status(500).send({ success: false, message: "An error occurred while fetching chat participants." });
    }
};


// profile

export const updateUserProfile = async (req, res) => {
    try {
        const { fullname, username, email, gender, profilepic } = req.body;
        const user = req.user; 

        // Update the user profile data
        user.fullname = fullname || user.fullname;
        user.username = username || user.username;
        user.email = email || user.email;
        user.gender = gender || user.gender;
        user.profilepic = profilepic || user.profilepic;

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

//get
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
                profilepic: user.profilepic
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error fetching user profile' });
    }
};

//deleting user
// Delete user account
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
