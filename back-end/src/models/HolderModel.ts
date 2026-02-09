import BaseModel, { type DeleteManyByIdArgsProps } from "@/classes/BaseModel";
import Utilities from "@/classes/Utilities";
import mongoose, { Model } from "mongoose";
import CardModel, { CardType } from "./CardModel";
import BankAccountModel from "./BankAccountModel";
import UserModel from "./UserModel";

/**
 * Enum degli stati del titolare
 */
export enum HolderStatus {
  active = "active",
  pending_verification = "pending_verification"
}

/**
 * Schema per la geometria (coordinate lat/lon)
 */
const GeometrySchema = new mongoose.Schema({
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: (arr: number[]) => arr.length === 2,
      message: "coordinates must contain exactly 2 numbers",
    },
  },
  type: { type: String, required: true },
}, { _id: false });

/**
 * Schema per le proprietà dell'indirizzo
 */
const PropertiesSchema = new mongoose.Schema({
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
}, { _id: false });

/**
 * Schema completo dell'indirizzo
 */
const AddressSchema = new mongoose.Schema({
  bbox: {
    type: [Number],
    validate: {
      validator: (arr: number[]) => arr.length <= 0 || arr.length === 4,
      message: "bbox must contain exactly 4 numbers",
    },
  },
  geometry: { type: GeometrySchema, required: true },
  properties: { type: PropertiesSchema, required: true },
  type: { type: String, required: true },
}, { _id: false });

/**
 * Schema principale del titolare (Holder)
 */
const holderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  taxCode: { type: String, required: true, unique: [true, "This tax code already exist"] },
  email: { type: String, required: true, unique: [true, "This email already exist"] },
  phoneNumber: { type: String, required: true },
  address: { type: AddressSchema, required: true },
  status: { type: String, enum: HolderStatus, default: HolderStatus.pending_verification, required: [true, "Enter status"] },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret: Record<string, any>): HolderProps => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v; // rimuove __v durante la conversione in JSON
      return ret as HolderProps;
    }
  }
});

const holderModel = mongoose.model<any, Model<HolderProps>>("holder", holderSchema);
type HolderSchemaProps = mongoose.InferSchemaType<typeof holderSchema>;
export type HolderProps = HolderSchemaProps & { id: string };
export type HolderDocument = mongoose.HydratedDocument<HolderSchemaProps>;

/**
 * HolderModel estende BaseModel e gestisce logica avanzata per i titolari
 */
class HolderModel extends BaseModel<HolderDocument> {

  /**
   * Override deleteManyById
   * - Elimina titolari
   * - Aggiorna gli utenti rimuovendo i riferimenti ai titolari cancellati
   * - Elimina tutti i bank account collegati
   * - Elimina tutte le carte prepagate collegate
   */
  override async deleteManyById(...args: DeleteManyByIdArgsProps<HolderDocument>) {
    const [ids, options] = args;
    return await Utilities.followSession(options?.session, async(session) => {
      // Cancella titolari
      const result = await super.deleteManyById(ids, { ...options, session });

      // Aggiorna gli utenti rimuovendo i titolari cancellati
      await UserModel.getInstance().updateMany(
        { holders: { $in: ids } },            // utenti che contengono almeno uno di questi titolari
        { $pull: { holders: { $in: ids } } }, // rimuove tutti quelli presenti
        { ...options, session }
      );

      // Cancella tutti i conti bancari collegati ai titolari
      await BankAccountModel.getInstance().deleteMany({ holderId: { $in: ids } }, { ...options, session });

      // Cancella tutte le carte prepagate collegate ai titolari
      await CardModel.getInstance().deleteMany({ holderId: { $in: ids }, type: CardType.prepaid }, { ...options, session });

      return result;
    });
  }
}

// Singleton
HolderModel.getInstance(holderModel);
export default HolderModel;