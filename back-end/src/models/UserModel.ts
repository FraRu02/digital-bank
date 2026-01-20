import mongoose, { Model, Query } from "mongoose";
import { type HolderProps } from "./HolderModel";
import BankAccountModel from "./BankAccountModel";
import CardModel, { CardType } from "./CardModel";
import BaseModel, { CreateArgsProps, type DeleteManyByIdArgsProps } from "@/classes/BaseModel";
import Utilities from "@/classes/Utilities";
import UserController from "@/controllers/UserController";

export enum UserRole {
  member = "member",
  admin = "admin"
}

export enum UserStatus  {
  active = "active",
  pending_verification = "pending_verification"
}

// type QueryHelpers = {
//   porco: () => UserDocument;
// }

// type UserMethods = {
//   dio: () => UserDocument;
// };

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  taxCode: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, "Enter email"],
    unique: [true, "this email already exist"]
  },
  password: {
    type: String,
    required: [true, "Enter password"],
    select: false
  },
  role: {
    type: String,
    enum: UserRole,
    required: true,
    default: UserRole.member 
  },
  holders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'holder',
    select: false
  }],
  status: {
    type: String,
    enum: UserStatus,
    required: true,
    default: UserStatus.pending_verification 
  },
  otpCodeHash: {
    type: String,
    required: true,
    select: false
  },
  otpExpiresAt: {
    type: Date,
    required: true ,
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
    transform: function (doc, ret: Record<string, any>) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v; // Rimuove __v durante la conversione in JSON
      delete ret.password; 
      return ret;
    }
  }
})
userSchema.methods.dio = function () {
  const obj = this.toObject();
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
};

export type UserSchemaProps = mongoose.InferSchemaType<typeof userSchema>;
export type UserProps = UserSchemaProps & {id: string;};
export type UserDocument = mongoose.HydratedDocument<UserSchemaProps>;
const userModel = mongoose.model<any, Model<UserDocument>>("user", userSchema);

class UserModel extends BaseModel<UserDocument> {

  override async create(...args: CreateArgsProps<UserDocument>) {
    const [newDocuments, ...others] = args;
    for (let index = 0; index < newDocuments.length; index++) {
      const element = newDocuments[index]
      element.password = await UserController.cryptPassword(element.password!);
    }
    return await super.create(newDocuments, ...others);
  }

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

UserModel.getInstance(userModel);
export default UserModel;
