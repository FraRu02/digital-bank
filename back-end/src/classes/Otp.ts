import crypto from "crypto";
import bcrypt from "bcrypt";

abstract class Otp {
  static async generate() {
    const otp = crypto.randomInt(100000, 999999).toString();
    // hash OTP
    const otpHash = await bcrypt.hash(otp, 10);
    return {
      otp,
      otpCodeHash: otpHash,
      otpExpiresAt: new Date(Date.now() + 3 * 60 * 1000),// 3 min
      otpAttempts: 0
    }
  }
}

export default Otp;