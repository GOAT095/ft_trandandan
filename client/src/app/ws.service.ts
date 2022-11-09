import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3000/");

  notifications : any[] = [];
  chatMessages : any[] = [];

  constructor() {
    this.socket.on("connect", () => {
        const engine = this.socket.io.engine;
        console.log(engine.transport.name); // in most cases, prints "polling"

        engine.once("upgrade", () => {
          // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
          console.log(engine.transport.name); // in most cases, prints "websocket"
        });

        engine.on("packet", ({ type, data }) => {
          // called for each packet received
        });

        engine.on("packetCreate", ({ type, data }) => {
          // called for each packet sent
        });

        engine.on("drain", () => {
          // called when the write buffer is drained
        });

        engine.on("close", (reason) => {
          // called when the underlying connection is closed
        });
    })
    this.socket.on("disconnect", () => {
      console.log(this.socket.id)
    })
  }
  notify(type: string, data: any) {
    this.socket.emit("notification", {"type": type, "data": data});
  }
  handleNotify() {
    this.socket.on('notification', (data) => {
      this.notifications.push(data);
    });
  }
  handleChatMessage() {
    this.socket.on('chatMessage', (data) => {
      this.chatMessages.push(data)
    })
  }
  postToChat(room: string, message: string, player: Player) {
    this.socket.emit("chatMessage", {'player': player, 'message': message})
  }
}
