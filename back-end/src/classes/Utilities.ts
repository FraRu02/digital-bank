import mongoose, { type ClientSession } from "mongoose";

const MAX_RETRIES = 5;
abstract class Utilities {


  static async followSession<T>(session: ClientSession | undefined | null, callback: (session: ClientSession) => T): Promise<T> {

    if (session) return callback(session);

    const newSession = await mongoose.startSession();

    try {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          let result!: T;

          await newSession.withTransaction(async () => {
            result = await callback(newSession);
          });

          return result;
        } catch (error: any) {
          if (error?.errorLabels?.includes("TransientTransactionError")) {
            console.warn(`Retry transaction (attempt ${attempt})`);
            await Utilities.sleep(100 * attempt); // backoff
            continue;
          }
          throw error;
        }
      }

      throw new Error("Transaction failed after max retries");

    } finally {
      await newSession.endSession();
    }
  }

  static async sleep(timeout:number):Promise<void> {
    return await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timeout)
    })
  }

}

export default Utilities;