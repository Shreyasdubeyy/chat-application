// controllers/blockUnblockController.js

import UserBlock from '../Models/UserBlockSchema.js';


// Check if User is Blocked
export const checkBlockStatus = async (req, res) => {
  const { blockerId, blockedId } = req.query; // Retrieve the blockerId and blockedId from query params

  try {
    const existingBlock = await UserBlock.findOne({ blocker: blockerId, blocked: blockedId });

    // If the block record exists, the user is blocked
    if (existingBlock) {
      return res.status(200).json({ isBlocked: true });
    } else {
      return res.status(200).json({ isBlocked: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error checking block status.' });
  }
};

// Block user
export const blockUser = async (req, res) => {
  const { blockerId, blockedId } = req.body;
  try {
    const existingBlock = await UserBlock.findOne({ blocker: blockerId, blocked: blockedId });

    if (existingBlock) {
      return res.status(400).json({ message: 'User already blocked.' });
    }

    const newBlock = new UserBlock({ blocker: blockerId, blocked: blockedId });
    await newBlock.save();

    res.status(200).json({ message: 'User blocked successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error blocking user.' });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  const { blockerId, blockedId } = req.body;
  try {
    const existingBlock = await UserBlock.findOneAndDelete({ blocker: blockerId, blocked: blockedId });

    if (!existingBlock) {
      return res.status(400).json({ message: 'User not blocked.' });
    }

    res.status(200).json({ message: 'User unblocked successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unblocking user.' });
  }
};
