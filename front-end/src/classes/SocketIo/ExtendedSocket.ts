import type { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";
import SocketIo from "./SocketIo";


class ExtendedSocket extends Socket<DefaultEventsMap, DefaultEventsMap> {

  override disconnect(): this {
    this.removeAllListeners();
    SocketIo.instance = null;
    return super.disconnect();
  }
}

export default ExtendedSocket;