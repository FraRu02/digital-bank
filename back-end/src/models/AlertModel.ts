import BaseModel from "@/classes/BaseModel";
import mongoose, { Model } from "mongoose";

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true 
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  senderDescription: {
    type: String,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret: Record<string, any>):AlertProps => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v; // Rimuove __v durante la conversione in JSON
      return ret as AlertProps;
    }
  }
}
);
const alertModel = mongoose.model<any, Model<AlertProps>>("alert", alertSchema);
type AlertSchemaProps = mongoose.InferSchemaType<typeof alertSchema>;
export type AlertProps = AlertSchemaProps & {id: string};
export type AlertDocument = mongoose.HydratedDocument<AlertSchemaProps>;


class AlertModel extends BaseModel<AlertDocument> {
  
}

AlertModel.getInstance(alertModel);

export default AlertModel;