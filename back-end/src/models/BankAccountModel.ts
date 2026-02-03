import mongoose from "mongoose";
import CardModel, { CardDocument } from "./CardModel";
import BaseModel, { type AggregateArgsProps, type DeleteManyByIdArgsProps, type DeleteManyArgsProps } from "@/classes/BaseModel";
import Utilities from "@/classes/Utilities";
import TransactionModel from "./TransactionModel";

export enum BankAccountStatus {
  active = "active",
  pending_verification = "pending_verification",
  suspended = "suspended",
  blocked = "blocked",
  closed = "closed"
}

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
  otpCodeHash: {
    type: String,
    required: true,
    select: false
  },
  otpExpiresAt: {
    type: Date,
    required: true,
    select: false
  },
  otpAttempts: {
    type: Number,
    required: true,
    default: 0,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    getters: true,
    transform: function (doc, ret: Record<string, any>) {
      ret.id = ret._id;
      delete ret._id; 
      delete ret.__v; // Rimuove __v durante la conversione in JSON
      return ret;
    }
  }
}
);
const bankAccountModel = mongoose.model<any, mongoose.Model<BankAccountProps>>("bankAccount", bankAccountSchema);
type BankAccountSchemaProps = Omit<mongoose.InferSchemaType<typeof bankAccountSchema>, "balance"> & {balance: number;};
export type BankAccountProps = BankAccountSchemaProps & {id: string};
export type BankAccountDocument = mongoose.HydratedDocument<BankAccountSchemaProps>;


class BankAccountModel extends BaseModel<BankAccountDocument> {

  override async aggregate(...args: AggregateArgsProps<CardDocument>) {
    const [pipeline, options] = args;
    const defaultPipeline:mongoose.PipelineStage[] = [
      { $set: { id: "$_id"}},
      { $unset: ["_id", "__v", "otpCodeHash"]},
      {
        $set: {
          otpExpiresAt: {
            $cond: [
              { $eq: ["$status", BankAccountStatus.pending_verification] },
              "$otpExpiresAt",
              "$$REMOVE"
            ]
          },
          otpAttempts: {
            $cond: [
              { $eq: ["$status", BankAccountStatus.pending_verification] },
              "$otpAttempts",
              "$$REMOVE"
            ]
          },
          iban: {
            $cond: [
              { $eq: ["$status", BankAccountStatus.active] },
              "$iban",
              "$$REMOVE"
            ]
          }
        }
      }
    ];
    return await super.aggregate([
      ...pipeline,
      ...defaultPipeline,
    ], options);
  }

  override async deleteManyById(...args: DeleteManyByIdArgsProps<BankAccountDocument>) {
    const [ids, options] = args;
    return await Utilities.followSession(options?.session, async(session) => {
      const result = await super.deleteManyById(ids, {...options, session});
      await CardModel.getInstance().deleteMany({bankAccountId: {$in: ids}}, {...options, session});
      return result;
    });
  }

  override async deleteMany(...args: DeleteManyArgsProps<BankAccountDocument>) {
    const [filter, options] = args;
    return await Utilities.followSession(options?.session, async(session) => {
      const bankAccountsIds = await this.getMany(filter, undefined, {session}).then((res) => res.map((e) => e.id));
      const result = await super.deleteMany(filter, {...options, session});
      await CardModel.getInstance().deleteMany({bankAccountId: {$in: bankAccountsIds}}, {...options, session});
      return result;
    });
  }

}

BankAccountModel.getInstance(bankAccountModel);
export default BankAccountModel;