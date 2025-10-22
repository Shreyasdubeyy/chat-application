import Conversation from "../Models/conversationModel.js";
import Message from "../Models/messageSchema.js";
import UserBlock from "../Models/UserBlockSchema.js"; // Import the UserBlock model
import { getReciverSocketId, io } from "../Socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { messages } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if the sender is blocked by the receiver
    const blockEntry = await UserBlock.findOne({ blocker: receiverId, blocked: senderId });
    if (blockEntry) {
      return res.status(403).json({ success: false, message: "You are blocked and cannot send messages." });
    }

    let chats = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!chats) {
      chats = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: messages,
      conversationId: chats._id,
    });

    if (newMessage) {
      chats.messages.push(newMessage._id);
    }

    await Promise.all([chats.save(), newMessage.save()]);

    // Send message via socket to receiver if they are online
    const receiverSocketId = getReciverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).send(newMessage);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error,
    });
    console.log(`Error in sendMessage ${error}`);
  }
};



export const getMessages=async(req,res)=>{
try {
    const {id:receiverId} = req.params;
    const senderId = req.user._id;

    const chats = await Conversation.findOne({
        participants:{$all:[senderId , receiverId]}
    }).populate("messages")

    if(!chats)  return res.status(200).send([]);
    const message = chats.messages;
    res.status(200).send(message)
} catch (error) {
    res.status(500).send({
        success: false,
        message: error
    })
    console.log(`error in getMessage ${error}`);
}
}


