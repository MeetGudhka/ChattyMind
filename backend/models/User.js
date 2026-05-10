import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  tagline: { type: String, default: 'Available' },
  phoneNumber: { type: String, default: '' },
  baseTone: { type: String, enum: ['Casual', 'Professional', 'Friendly', 'Expressive'], default: 'Casual' },
  settings: {
    accentColor: { type: String, default: 'cyan-purple' },
    aiSuggestionsEnabled: { type: Boolean, default: true },
    readReceipts: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
