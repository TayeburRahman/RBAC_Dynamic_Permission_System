import mongoose, { Document } from 'mongoose';

export type IAdmin = Document & {
  _id: mongoose.Schema.Types.ObjectId;
  authId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone_number: string;
  profile_image?: string | null;
};
