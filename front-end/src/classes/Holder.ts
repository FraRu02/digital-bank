import server from "@/src/axiosConfig";
import Utilities from "./Utilities";
import type { AddressProps } from "@/src/components/inputs/AddressAutocomplete";

abstract class Holder {

  static async getMe():Promise<HolderProps[]> {
    
    return await server.get("/holders/me").then((res) => res.data);
  }

  static async getMeById(id: string):Promise<HolderProps> {
    
    return await server.get(`/holders/me/${id}`).then((res) => res.data);
  }

  static async getAll():Promise<HolderProps[]> {
    
    return await server.get("/holders").then((res) => res.data);
  }

  static async delete(id: string|string[]): Promise<void> {
    
    return await server.delete("/holders", {data: {
      holderIds: Array.isArray(id) ? id : [id]
    }}).then((res) => res.data);
  }
}

export type HolderProps = {
  id: string;
  name: string;
  lastname: string;
  dateOfBirth: string;
  taxCode: string;
  email: string;
  phoneNumber: string;
  address: AddressProps;
  createdAt: string;
  updatedAt: string;
}

export default Holder;