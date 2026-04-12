import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  baseTone: { type: String, enum: ['Casual', 'Professional', 'Friendly', 'Expressive'], default: 'Casual' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
