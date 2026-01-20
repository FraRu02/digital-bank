import mongoose, {Model} from "mongoose";
import TransactionModel from "./TransactionModel";
import BaseModel, {DeleteManyByIdArgsProps, type DeleteByIdArgsProps, type DeleteManyArgsProps } from "@/classes/BaseModel";
import Utilities from "@/classes/Utilities";
type DeleteOptions = mongoose.mongo.DeleteOptions;
type UpdateOptions = mongoose.mongo.UpdateOptions;

export enum CardType {
  debit = "debit",
  prepaid = "prepaid"
}

export enum CardStatus {
  active = "active",
  inactive = "inactive",
  blocked = "blocked",
  expired = "expired",
  replaced = "replaced",
  cancelled = "cancelled"
}


const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "Enter userId"],
  },
  number: {
    type: String,
    unique: true,
    required: [true, "Enter card number"]
  },
  type: {
    type: String,
    enum: CardType,
    required: [true, "Enter card type"]
  },
  expire: {
    type: Date,
    required: true,
  },
  cvv: {
    type: String,
    required: true
  },
  holderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "holder",
  },
  status: {
    type: String,
    enum: CardStatus,
    default: CardStatus.inactive,
    required: [true, "Enter status"],
  },
  bankAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "bankAccount",
  },
  balance: {
    type: mongoose.Schema.Types.Decimal128,
    get: (v: mongoose.Types.Decimal128) => v ? parseFloat(v.toString()) : 0
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

export const cardModel = mongoose.model<any, Model<CardProps>>("card", cardSchema);
type PickRequiredNonNull<T, K extends keyof T> ={ [P in K]-?: NonNullable<T[P]> };
type CardSchemaProps = Omit<mongoose.InferSchemaType<typeof cardSchema>, "balance"> & {balance: number};
export type CardProps = CardSchemaProps & {id: string};
export type CardDocument = mongoose.HydratedDocument<CardSchemaProps>;
export type BaseCardProps = Omit<CardProps, "bankAccountId"|"balance">;
export type DebitCardProps = BaseCardProps & PickRequiredNonNull<CardProps, "bankAccountId">;
export type PrepaidCardProps = BaseCardProps & PickRequiredNonNull<CardProps, "balance">;
class CardModel extends BaseModel<CardDocument> {

  // async create(card: PickCreateProps<DebitCardProps>[], options?: CreateOptions):Promise<DebitCardDocument[]>;
  // async create(card: PickCreateProps<PrepaidCardProps>[], options?: CreateOptions):Promise<PrepaidCardDocument[]>;
  // async create(card: PickCreateProps<CardSchemaProps>[], options?: CreateOptions) {
  //   if (CardModel.isDebitType(card[0])) {
  //     return await CardModel.createDebit(card as DebitCardProps[], options);
  //   } else if (CardModel.isPrepaidType(card[0])) {
  //     return CardModel.createPrepaid(card as PrepaidCardProps[], options);
  //   }
  // };

  override async deleteById(...args: DeleteByIdArgsProps<CardDocument>) {
    const [id, options] = args;
    return await Utilities.followSession(options?.session, async(session) => {
      const result = await super.deleteById(id, {...options, session});
      await TransactionModel.getInstance().deleteMany({$or: [
        {sourceCardId: id},
        {destinationCardId: id}
      ]}, {session});
      return result;
    });
  }

  override async deleteManyById(...args: DeleteManyByIdArgsProps<CardDocument>) {
    const [ids, options] = args;
    return await Utilities.followSession(options?.session, async(session) => {
      const result = await super.deleteManyById(ids, {...options, session});
      await TransactionModel.getInstance().deleteMany({$or: [
        {sourceCardId: {$in: ids}},
        {destinationCardId: {$in: ids}}
      ]}, {session});
      return result;
    });
  }
  
  override async deleteMany(...args: DeleteManyArgsProps<CardDocument>) {
    const [filter, options] = args;
    return await Utilities.followSession(options?.session, async(session) => {
      const cardsIds = await this.getMany(filter, undefined, {session}).then((res) => res.map((e) => e.id));
      const result = await super.deleteMany(filter, {...options, session});
      await TransactionModel.getInstance().deleteMany({$or: [
        {sourceCardId: {$in: cardsIds}},
        {destinationCardId: {$in: cardsIds}}
      ]}, {...options, session});
      return result;
    });
  }

  static isDebitType(card: any): card is DebitCardProps {
    return card.bankAccountId && card.type === CardType.debit;
  }

  static isPrepaidType(card: any): card is PrepaidCardProps {
    return !Number.isNaN(card.balance) && card.type === CardType.prepaid;
  }
}
CardModel.getInstance(cardModel);
export default CardModel;