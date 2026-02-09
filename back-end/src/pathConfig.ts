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