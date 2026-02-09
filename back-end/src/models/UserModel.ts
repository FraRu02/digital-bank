/**
 * Modello Mongoose per la gestione degli utenti.
 *
 * Include:
 * - definizione dello schema utente con campi obbligatori e validazioni
 * - hash della password alla creazione
 * - gestione OTP per verifica email
 * - override per la cancellazione degli utenti che rimuove anche conti bancari e carte prepagate associate
 * - trasformazione JSON per nascondere campi sensibili
 */

import mongoose, { Model } from "mongoose";
import BankAccountModel from "./BankAccountModel";
import CardModel, { CardType } from "./CardModel";
import BaseModel, { CreateArgsProps, type DeleteManyByIdArgsProps } from "@/classes/BaseModel";
import Utilities from "@/classes/Utilities";
import UserController from "@/controllers/UserController";

// Ruoli utente
export enum UserRole {
  member = "member",
  admin = "admin"
}

// Stati utente
export enum UserStatus  {
  active = "active",
  pending_verification = "pending_verification"
}

// Schema utente
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  taxCode: { type: String, required: true, unique: true },
  email: { type: String, required: [true, "Enter email"], unique: [true, "this email already exist"] },
  password: { type: String, required: [true, "Enter password"], select: false }, // password nascosta di default
  role: { type: String, enum: UserRole, required: true, default: UserRole.member },
  holders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'holder', select: false }], // riferimenti agli holders dell'utente
  status: { type: String, enum: UserStatus, required: true, default: UserStatus.pending_verification },
  otpCodeHash: { type: String, required: true, select: false }, // hash OTP per verifica
  otpExpiresAt: { type: Date, required: true, select: false }, // scadenza OTP
  otpAttempts: { type: Number, required: true, default: 0, select: false } // numero tentativi OTP
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret: Record<string, any>) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v; // Rimuove __v durante la conversione in JSON
      delete ret.password; // Rimuove password dall'output JSON
      return ret;
    }
  }
});

// Tipizzazioni TypeScript
export type UserSchemaProps = mongoose.InferSchemaType<typeof userSchema>;
export type UserProps = UserSchemaProps & {id: string;};
export type UserDocument = mongoose.HydratedDocument<UserSchemaProps>;

// Modello Mongoose
const userModel = mongoose.model<any, Model<UserDocument>>("user", userSchema);

class UserModel extends BaseModel<UserDocument> {

  /**
   * Override del metodo create per hashare la password prima della creazione
   */
  override async create(...args: CreateArgsProps<UserDocument>) {
    const [newDocuments, ...others] = args;
    for (let index = 0; index < newDocuments.length; index++) {
      const element = newDocuments[index];
      element.password = await UserController.cryptPassword(element.password!); // hashing password
    }
    return await super.create(newDocuments, ...others);
  }

  /**
   * Override del metodo deleteManyById per:
   * - cancellare l'utente
   * - cancellare tutti i conti bancari associati
   * - cancellare tutte le carte prepagate associate
   */
  override async deleteManyById(...args: DeleteManyByIdArgsProps<UserDocument>) {
    const [ids, options] = args;
    return await Utilities.followSession(options?.session, async(session) => {
      const result = await super.deleteManyById(ids, {...options, session});
      await BankAccountModel.getInstance().deleteMany({userId: {$in: ids}}, {...options, session});
      await CardModel.getInstance().deleteMany({userId: {$in: ids}, type: CardType.prepaid}, {...options, session});
      return result;
    });
  }
}

// Inizializza istanza singleton
UserModel.getInstance(userModel);
export default UserModel;