import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: { 
      type: Schema.Types.ObjectId, 
      ref: "Auth", 
      required: true,
      index: true
    },
    sender: { 
      type: Schema.Types.ObjectId, 
      ref: "Auth" 
    },
    title: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["TASK_ASSIGNED", "TASK_STATUS_UPDATE", "ORDER_CREATED", "NEW_MESSAGE", "TICKET_UPDATE", "SYSTEM"],
      required: true 
    },
    link: { 
      type: String 
    },
    isRead: { 
      type: Boolean, 
      default: false,
      index: true
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model("Notification", notificationSchema);
