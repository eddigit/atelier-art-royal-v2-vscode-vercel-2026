import mongoose, { Schema, Document } from 'mongoose';

export interface IChatSettings extends Document {
  key: string;
  instructions: string;
  is_active: boolean;
  updated_at: Date;
  updated_by?: string;
}

const ChatSettingsSchema = new Schema<IChatSettings>({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'commercial_assistant'
  },
  instructions: {
    type: String,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.models.ChatSettings || mongoose.model<IChatSettings>('ChatSettings', ChatSettingsSchema);
