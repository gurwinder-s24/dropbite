import { HydratedDocument, Schema, model } from "mongoose";

export interface AddressInterface {
  userId: string;
  mobile: number;

  formattedAddress: string;

  location: {
    type: "Point";
    coordinates: [number, number];
  };
}

export type AddressDocument = HydratedDocument<AddressInterface>;

const schema = new Schema<AddressInterface>(
  {
    userId: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    formattedAddress: {
      type: String,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ location: "2dsphere" });

export default model<AddressInterface>("Address", schema);
