import { Types, HydratedDocument, Schema, model } from "mongoose";

export interface OutletInterface {
  ownerId: Types.ObjectId;
  name: string;
  description?: string;
  image: string;
  phone: number;
  isVerified: boolean;

  autoLocation: {
    type: "Point";
    coordinates: [number, number]; //[longitude, latitude]
    formattedAddress: string;
  };
  isOpen: boolean;
  createdAt: Date;
}

export type OutletDocument = HydratedDocument<OutletInterface>;

const schema = new Schema<OutletInterface>(
  {
    ownerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    image: { type: String, required: true },
    phone: { type: Number, required: true },
    isVerified: { type: Boolean, required: true },

    autoLocation: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
      formattedAddress: { type: String },
    },
    isOpen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

schema.index({ autoLocation: "2dsphere" });

export default model<OutletInterface>("Outlet", schema);
