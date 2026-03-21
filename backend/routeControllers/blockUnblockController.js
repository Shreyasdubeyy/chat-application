// controllers/blockUnblockController.js

import UserBlock from '../Models/UserBlockSchema.js';


// Check if User is Blocked
export const checkBlockStatus = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  try {
    const existingBlock = await UserBlock.findOne({ blocker: currentUserId, blocked: userId });
    return res.status(200).json({ isBlocked: !!existingBlock });
  } catch (error) {
    console.error("Error checking block status:", error);
    res.status(500).json({ message: 'Error checking block status.' });
  }
};

// Block user
export const blockUser = async (req, res) => {
  const { blockedId } = req.body;
  const blockerId = req.user._id;

  if (!blockedId) {
    return res.status(400).json({ message: 'Blocked user ID is required.' });
  }

  if (blockerId.toString() === blockedId.toString()) {
    return res.status(400).json({ message: 'You cannot block yourself.' });
  }

  try {
    const existingBlock = await UserBlock.findOne({ blocker: blockerId, blocked: blockedId });

    if (existingBlock) {
      return res.status(400).json({ message: 'User already blocked.' });
    }

    const newBlock = new UserBlock({ blocker: blockerId, blocked: blockedId });
    await newBlock.save();

    res.status(200).json({ message: 'User blocked successfully.' });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ message: 'Error blocking user.' });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  const { blockedId } = req.body;
  const blockerId = req.user._id;

  if (!blockedId) {
    return res.status(400).json({ message: 'Blocked user ID is required.' });
  }

  try {
    const existingBlock = await UserBlock.findOneAndDelete({ blocker: blockerId, blocked: blockedId });

    if (!existingBlock) {
      return res.status(400).json({ message: 'User not blocked.' });
    }

    res.status(200).json({ message: 'User unblocked successfully.' });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ message: 'Error unblocking user.' });
  }
};
