import jwt from "jsonwebtoken";
import process from "process";

abstract class JwtController {
  static generateAccessJwt (userId:string):string {
    return jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m"});
  }
  
  static generateRefreshJwt(userId:string):string {
    return jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "1h" });
  }

  static generateTempJwt (userId:string):string {
    return jwt.sign({userId}, process.env.TEMP_TOKEN_SECRET!, { expiresIn: "3m"});
  }
  
  static verifyAccessJwt(token:string):string|null {
    let isVerify = null;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, payload:any) => {
      if (err) isVerify = null;
      else isVerify = payload.userId;
    });
    return isVerify;
  }
  
  static verifyRefreshJwt(token:string):string|null {
    let isVerify = null;
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, (err, payload:any) => {
      if (err) isVerify = null;
      else isVerify = payload.userId;
    });
    return isVerify;
  }

  static async verifyTempJwt(token:string):Promise<{
    isVerify: boolean;
    payload: any;
  }> {
    return await new Promise((resolve) => {
      jwt.verify(token, process.env.TEMP_TOKEN_SECRET!, (err) => {
        const payload = jwt.decode(token)
        resolve({
          isVerify: !Boolean(err),
          payload
        });
      });
    })
  }
}

export default JwtController;