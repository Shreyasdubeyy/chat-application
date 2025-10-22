// models/userBlockModel.js
import mongoose from 'mongoose';

const userBlockSchema = mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referring to the User model
      required: true,
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const UserBlock = mongoose.model('UserBlock', userBlockSchema);

export default UserBlock;
