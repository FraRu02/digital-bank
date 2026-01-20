import BaseModel, { type DeleteManyByIdArgsProps } from "@/classes/BaseModel";
import Utilities from "@/classes/Utilities";
import mongoose, { Model, Query } from "mongoose";
import CardModel, { CardType } from "./CardModel";
import BankAccountModel from "./BankAccountModel";

const GeometrySchema = new mongoose.Schema(
  {
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr: number[]) => arr.length === 2,
        message: "coordinates must contain exactly 2 numbers",
      },
    },
    type: { type: String, required: true },
  },
  { _id: false }
);

const PropertiesSchema = new mongoose.Schema(
  {
    place_id: { type: String, required: true },
    formatted: { type: String, required: true },
    street: { type: String, required: true },
    housenumber: { type: String, required: true },
    city: { type: String, required: true },
    postcode: { type: String, required: true },
    country: { type: String, required: true },
    country_code: { type: String, required: true },
    state: { type: String, required: true },
    county: { type: String, required: true },
    county_code: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema({
  bbox: {
    type: [Number],
    validate: {
      validator: (arr: number[]) => arr.length <=0 || arr.length === 4,
      message: "bbox must contain exactly 4 numbers",
    },
  },
  geometry: {
    type: GeometrySchema,
    required: true,
  },
  properties: {
    type: PropertiesSchema,
    required: true,
  },
  type: { type: String, required: true },
}, { _id: false });


const holderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  taxCode: {
    type: String,
    required: true,
    unique: [true, "this tax code already exist"]
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: AddressSchema,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret: Record<string, any>):HolderProps => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v; // Rimuove __v durante la conversione in JSON
      return ret as HolderProps;
    }
  }
}
);
const holderModel = mongoose.model<any, Model<HolderProps>>("holder", holderSchema);
type HolderSchemaProps = mongoose.InferSchemaType<typeof holderSchema>;
export type HolderProps = HolderSchemaProps & {id: string};
export type HolderDocument = mongoose.HydratedDocument<HolderSchemaProps>;


class HolderModel extends BaseModel<HolderDocument> {

  override async deleteManyById(...args: DeleteManyByIdArgsProps<HolderDocument>) {
    const [ids, options] = args;
    return await Utilities.followSession(options?.session, async(session) => {
      const result = await super.deleteManyById(ids, {...options, session});
      await BankAccountModel.getInstance().deleteMany({holderId: {$in: ids}}, {...options, session});
      await CardModel.getInstance().deleteMany({holderId: {$in: ids}, type: CardType.prepaid}, {...options, session});
      return result;
    });
  }


}

HolderModel.getInstance(holderModel);

export default HolderModel;