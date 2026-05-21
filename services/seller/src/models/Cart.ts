import { Types, HydratedDocument, Schema, model } from "mongoose";

export interface CartInterface {
  userId: Types.ObjectId;
  outletId: Types.ObjectId;
  itemId: Types.ObjectId;
  quantity: number;
}

export type CartDocument = HydratedDocument<CartInterface>;

const schema = new Schema<CartInterface>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      index: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ userId: 1, outletId: 1, itemId: 1 }, { unique: true });

export default model<CartInterface>("Cart", schema);
