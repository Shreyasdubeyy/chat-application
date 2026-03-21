import Conversation from "../Models/conversationModel.js";
import Message from "../Models/messageSchema.js";
import UserBlock from "../Models/UserBlockSchema.js";
import { getReciverSocketId, io } from "../Socket/socket.js";
import cloudinary from "../utils/cloudinary.js";

export const sendMessage = async (req, res) => {
  try {
    const { messages, messageType } = req.body;
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

    let imageUrl = null;

    // Handle image upload if file is present
    if (req.file) {
      try {
        // Upload to Cloudinary using buffer
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'linkup/messages',
          resource_type: 'auto'
        });
        
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ success: false, message: 'Failed to upload image' });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: messages || '',
      messageType: imageUrl ? 'image' : 'text',
      imageUrl: imageUrl,
      conversationId: chats._id,
    });

    if (newMessage) {
      chats.messages.push(newMessage._id);
    }

    await Promise.all([chats.save(), newMessage.save()]);

    const receiverSocketId = getReciverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage.toObject());
    }

    res.status(201).send(newMessage.toObject());
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
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


