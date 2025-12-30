import mongoose, { Schema, Document } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface IReview extends Document {
  product_id: mongoose.Types.ObjectId;
  order_id?: mongoose.Types.ObjectId;
  customer_id: mongoose.Types.ObjectId;
  customer_name: string;
  customer_email: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  images?: string[];
  status: ReviewStatus;
  verified_purchase: boolean;
  helpful_count: number;
  response?: {
    text: string;
    responded_by: string;
    responded_at: Date;
  };
  created_at: Date;
  updated_at: Date;
}

const ReviewSchema: Schema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String },
  images: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verified_purchase: { type: Boolean, default: false },
  helpful_count: { type: Number, default: 0 },
  response: {
    text: { type: String },
    responded_by: { type: String },
    responded_at: { type: Date },
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

ReviewSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

ReviewSchema.index({ product_id: 1, status: 1 });
ReviewSchema.index({ customer_id: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ created_at: -1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
