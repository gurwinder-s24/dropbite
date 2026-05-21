import { Types, HydratedDocument, Schema, model } from "mongoose";

export interface MenuItemInterface {
  outletId: Types.ObjectId;
  name: string;
  description: string;
  image?: string;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MenuItemDocument = HydratedDocument<MenuItemInterface>;

const schema = new Schema<MenuItemInterface>(
  {
    outletId: { type: Schema.Types.ObjectId, ref: "Outlet", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<MenuItemInterface>("MenuItem", schema);
