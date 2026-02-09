/**
 * Funzioni di utilità generiche per gestione transazioni MongoDB e altre operazioni asincrone
 */

import mongoose, { type ClientSession } from "mongoose";

const MAX_RETRIES = 5;

/**
 * Classe astratta Utilities
 * Contiene metodi statici generici utilizzabili in tutto il progetto
 */
abstract class Utilities {

  /**
   * Esegue una funzione all'interno di una sessione MongoDB.
   * Se la sessione è già presente, la riutilizza.
   * Altrimenti crea una nuova sessione e riprova fino a MAX_RETRIES in caso di errore transitorio.
   * @param session - sessione MongoDB esistente (opzionale)
   * @param callback - funzione da eseguire all'interno della sessione
   * @returns risultato della callback
   */
  static async followSession<T>(
    session: ClientSession | undefined | null,
    callback: (session: ClientSession) => T
  ): Promise<T> {

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
            await Utilities.sleep(100 * attempt); // backoff incrementale
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

  /**
   * Funzione di utilità per creare un delay
   * @param timeout - tempo in millisecondi
   */
  static async sleep(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

}

export default Utilities;