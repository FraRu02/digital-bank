/**
 * Controller per la gestione dei JSON Web Token (JWT).
 *
 * Questo modulo centralizza:
 * - generazione dei token di accesso, refresh e temporanei
 * - verifica e decodifica dei token
 * - gestione delle scadenze dei diversi tipi di token
 *
 * I metodi sono statici perché il controller è stateless.
 */

import jwt from "jsonwebtoken";
import process from "process";

abstract class JwtController {

  /**
   * Genera un access token JWT.
   * Utilizzato per autenticare le richieste protette.
   */
  static generateAccessJwt(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
  }

  /**
   * Genera un refresh token JWT.
   * Utilizzato per rinnovare l'access token.
   */
  static generateRefreshJwt(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "1h" }
    );
  }

  /**
   * Genera un token JWT temporaneo.
   * Utilizzato durante il processo di verifica OTP.
   */
  static generateTempJwt(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.TEMP_TOKEN_SECRET!,
      { expiresIn: "3m" }
    );
  }

  /**
   * Verifica un access token JWT.
   * Restituisce l'userId se valido, altrimenti null.
   */
  static verifyAccessJwt(token: string): string | null {
    let isVerify = null;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, payload: any) => {
      if (err) isVerify = null;
      else isVerify = payload.userId;
    });
    return isVerify;
  }

  /**
   * Verifica un refresh token JWT.
   * Restituisce l'userId se valido, altrimenti null.
   */
  static verifyRefreshJwt(token: string): string | null {
    let isVerify = null;
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, (err, payload: any) => {
      if (err) isVerify = null;
      else isVerify = payload.userId;
    });
    return isVerify;
  }

  /**
   * Verifica un token temporaneo JWT.
   *
   * - restituisce un flag booleano di validità
   * - espone il payload decodificato del token
   */
  static async verifyTempJwt(
    token: string
  ): Promise<{
    isVerify: boolean;
    payload: any;
  }> {
    return await new Promise((resolve) => {
      jwt.verify(token, process.env.TEMP_TOKEN_SECRET!, (err) => {
        const payload = jwt.decode(token);
        resolve({
          isVerify: !Boolean(err),
          payload
        });
      });
    });
  }
}

export default JwtController;