import mongoose from "mongoose";
import CardModel from "./CardModel";
import BaseModel, { type DeleteManyByIdArgsProps, type DeleteManyArgsProps } from "@/classes/BaseModel";
import Utilities from "@/classes/Utilities";

/**
 * Enum degli stati di un conto bancario
 */
export enum BankAccountStatus {
  active = "active",
  pending_verification = "pending_verification",
  closed = "closed"
}

/**
 * Schema dei conti bancari
 */
const bankAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "Enter userId"],
  },
  holderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "holder",
    required: [true, "Enter holderId"],
  },
  iban: {
    type: String,
    required: [true, "Enter iban"],
    unique: [true, "this iban already exist"]
  },
  balance: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
    get: (v: mongoose.Types.Decimal128) => v ? parseFloat(v.toString()) : 0
  },
  currency: {
    type: String,
    default: "€",
    required: [true, "Enter currency"],
  },
  status: {
    type: String,
    enum: BankAccountStatus,
    default: BankAccountStatus.pending_verification,
    required: [true, "Enter status"],
  },
  otpCodeHash: { type: String, required: true, select: false },
  otpExpiresAt: { type: Date, required: true, select: false },
  otpAttempts: { type: Number, required: true, default: 0, select: false }
}, {
  timestamps: true,
  toJSON: {
    getters: true,
    transform: function (doc, ret: Record<string, any>) {
      ret.id = ret._id;
      delete ret._id; 
      delete ret.__v; 
      return ret;
    }
  }
});

const bankAccountModel = mongoose.model<any, mongoose.Model<BankAccountProps>>("bankAccount", bankAccountSchema);

/**
 * Tipi di proprietà del conto bancario
 */
type BankAccountSchemaProps = Omit<mongoose.InferSchemaType<typeof bankAccountSchema>, "balance"> & {balance: number;};
export type BankAccountProps = BankAccountSchemaProps & {id: string};
export type BankAccountDocument = mongoose.HydratedDocument<BankAccountSchemaProps>;

/**
 * BankAccountModel estende BaseModel e gestisce logica avanzata
 */
class BankAccountModel extends BaseModel<BankAccountDocument> {

  /**
   * Override deleteManyById:
   * elimina anche tutte le carte collegate ai conti
   */
  override async deleteManyById(...args: DeleteManyByIdArgsProps<BankAccountDocument>) {
    const [ids, options] = args;
    return await Utilities.followSession(options?.session, async(session) => {
      const result = await super.deleteManyById(ids, {...options, session});
      await CardModel.getInstance().deleteMany({bankAccountId: {$in: ids}}, {...options, session});
      return result;
    });
  }

  /**
   * Override deleteMany:
   * elimina conti e carte collegate filtrando tramite filtro
   */
  override async deleteMany(...args: DeleteManyArgsProps<BankAccountDocument>) {
    const [filter, options] = args;
    return await Utilities.followSession(options?.session, async(session) => {
      const bankAccountsIds = await this.getMany(filter, undefined, {session}).then(res => res.map(e => e.id));
      const result = await super.deleteMany(filter, {...options, session});
      await CardModel.getInstance().deleteMany({bankAccountId: {$in: bankAccountsIds}}, {...options, session});
      return result;
    });
  }

}

// Inizializza singleton
BankAccountModel.getInstance(bankAccountModel);
export default BankAccountModel;