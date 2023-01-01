import { APP_INITIALIZER, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  socket?: Socket<ServerToClientEvents, ClientToServerEvents>;

  notifications : any[] = [];
  chatMessages : any[] = [];
  roomChatMessages: any = {};
  directMessages: any = {};

  newMessageEvent = new Subject<any[]>;
  newDirectMessageEvent = new Subject<any[]>;
  newRoomMessageEvent = new Subject<any[]>;

  constructor() {

  }
  initialize(player: Player) {
    // from: https://gist.github.com/rendro/525bbbf85e84fa9042c2?permalink_comment_id=3076403#gistcomment-3076403
    let cookies = Object.fromEntries(document.cookie.split(/; */).map(c => {
      const [ key, ...v ] = c.split('=');
      return [ key, decodeURIComponent(v.join('=')) ];
    }));

    this.socket = io(environment.baseUrl, {auth: {'id': player.id, 'token': cookies['auth-cookie']}});
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
  notify(type: string, data: any, receiver: Player) {
    this.socket?.emit("notification", {"type": type, "data": data, "receiver": receiver});
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
      this.newMessageEvent.next(data);
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
      this.newRoomMessageEvent.next(data);
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
      this.newDirectMessageEvent.next(data);
    })
  }
}
