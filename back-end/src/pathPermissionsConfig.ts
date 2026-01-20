import { UserRole } from "./models/UserModel";

const baseUrl = "/api";

export enum PATH {
  auth = `${baseUrl}/auth`,
  user = `${baseUrl}/users`,
  bankAccount = `${baseUrl}/bankAccounts`,
  card = `${baseUrl}/cards`,
  transaction = `${baseUrl}/transactions`,
  holder = `${baseUrl}/holders`,
  alert = `${baseUrl}/alerts`,
}

// export const PATH_PERMISSIONS:{[K in keyof typeof PATH]?: Array<UserRole>} = {
//   transaction: [UserRole.admin],
//   // event: [UserRole.organizer],
// }