import { APP_INITIALIZER, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  socket?: Socket<ServerToClientEvents, ClientToServerEvents>;

  notifications : any[] = [];
  chatMessages : any[] = [];
  roomChatMessages: any = {};
  directMessages: any = {};

  constructor() {

  }
  initialize(player: Player) {
    this.socket = io("http://localhost:3000", {auth: {'id': player.id}});
    this.socket.on("connect", () => {
        const engine = this.socket?.io.engine;
        console.log(engine?.transport.name); // in most cases, prints "polling"

        engine?.once("upgrade", () => {
          // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
          console.log(engine.transport.name); // in most cases, prints "websocket"
        });

        engine?.on("packet", ({ type, data }) => {
          // called for each packet received
        });

        engine?.on("packetCreate", ({ type, data }) => {
          // called for each packet sent
        });

        engine?.on("drain", () => {
          // called when the write buffer is drained
        });

        engine?.on("close", (reason) => {
          // called when the underlying connection is closed
        });
    })
    this.socket.on("disconnect", () => {
      console.log(this.socket?.id)
    })
  }
  notify(type: string, data: any) {
    this.socket?.emit("notification", {"type": type, "data": data});
  }
  handleNotify() {
    this.socket?.on('notification', (data) => {
      this.notifications.push(data);
    });
  }
  handleChatMessage() {
    this.socket?.on('chatMessage', (data) => {
      console.log(data);
      this.chatMessages.push(data)
    })
  }
  postToRoom(room: any, message: string, player: Player) {
    this.socket?.emit("roomChatMessage", {'room': room, 'player': player, 'message': message})
  }
  postToChat(room: string, message: string, player: Player) {
    this.socket?.emit("chatMessage", {'player': player, 'message': message})
  }
  handleRoomChatMessage() {
    this.socket?.on('roomChatMessage', (data) => {
      console.log(data);
      let room = data.room;
      let message = {'message': data.message, 'player': data.player};
      if (!(room.id in this.roomChatMessages)) {
        this.roomChatMessages[room.id] = [];
      }
      this.roomChatMessages[room.id].push(message);
      console.log(this.roomChatMessages);
    })
  }
  sendDirectMessage(receiver: Player, message: string, player: Player) {
    this.socket?.emit("directMessage", {'receiver': receiver, 'player':player, 'message': message});
  }
  handleDirectMessage() {
    this.socket?.on('directMessage', (data) => {
      console.log(data);
      let player = data.player;
      let message = {'message': data.message, 'player': data.player};
      if (!(player.id in this.directMessages)) {
        this.directMessages[player.id] = [];
      }
      this.directMessages[player.id].push(message);
      console.log(this.directMessages);
    })
  }
}
