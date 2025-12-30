import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem extends Document {
  user_id?: mongoose.Types.ObjectId;
  session_id?: string; // Pour les guests
  product_id: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  customization?: string;
  created_at: Date;
  updated_at: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    session_id: { type: String, index: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    customization: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index composé pour récupérer le panier
CartItemSchema.index({ user_id: 1, product_id: 1 });
CartItemSchema.index({ session_id: 1, product_id: 1 });

// TTL index pour supprimer les paniers guests après 7 jours
CartItemSchema.index(
  { created_at: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60, partialFilterExpression: { user_id: null } }
);

const CartItem: Model<ICartItem> =
  mongoose.models.CartItem || mongoose.model<ICartItem>('CartItem', CartItemSchema);

export default CartItem;
