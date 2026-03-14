import mongoose, { Schema, Model } from "mongoose";
import { IAdmin } from "./admin.interface";

const AdminSchema = new Schema<IAdmin>(
  {
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    profile_image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Admin: Model<IAdmin> = mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
