import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  text: { type: String, default: '' },
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
  mediaUrl: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
