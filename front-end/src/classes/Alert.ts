import server from "@/src/axiosConfig";
import Utilities from "./Utilities";

abstract class Alert {

  static async getMe():Promise<AlertProps[]> {
    
    return await server.get("/alerts/me").then((res) => res.data);
  }

  static async deleteMe(id: string|string[]):Promise<void> {
    
    return await server.delete("/alerts/me", {data: {
      alertIds: Array.isArray(id) ? id : [id]
    }}).then((res) => res.data);
  }

}

export type AlertProps = {
  id: string;
  userId: string;
  title: string;
  content: string;
  senderDescription?: string;
  createdAt: string;
}

export default Alert;