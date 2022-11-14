import { SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RoomService } from 'src/api/chat/room/room.service';

@WebSocketGateway({cors: {origin: '*'}})
export class WsGateway {

  constructor(public room: RoomService) {}

  @WebSocketServer()
  private server: Server;

  clients = [];

  handleConnection(client: any) {
    this.clients.push(client)
    console.log('new client', client);
  }

  handleDisconnect(client: any) {
    // TODO
  }

  broadcast(event: string, data: any) {
    for (let client of this.clients) {
      client.emit(event, data);
      console.log("sent to : ", client.id)
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log("foobar");
    return 'Hello world!';
  }

  @SubscribeMessage('notification')
  handleNotification(client: any, payload: any) {
    console.log(payload);
    this.broadcast('notification', payload);
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(client: any, payload: any) {
    console.log(payload);
    this.broadcast('chatMessage', payload);
  }

  @SubscribeMessage('roomChatMessage')
  handleRoomChatMessage(client: any, payload: any) {
    console.log(payload);
    let room = this.room.findById(payload.room.id);
    // TODO: check if is a member 
    // Broadcast to connected clients which are members
    for (let client of this.clients) {
      //client.emit('', data);
      //console.log("sent to : ", client.id)
      let client_id = client.handshake.auth.id;
      if (room.members.includes(client_id)) {
        client.emit('roomChatMessage', payload);
      }
    }
  }

  @SubscribeMessage('directMessage')
  handleDirectMessage(client: any, payload: any) {
    console.log(payload);
    let receiver = payload.receiver.id;
    // TODO: check if is a member 
    // Broadcast to connected clients which are members
    for (let client of this.clients) {
      //client.emit('', data);
      //console.log("sent to : ", client.id)
      let client_id = client.handshake.auth.id;
      if (client_id == receiver) {
        client.emit('directMessage', payload);
        // break; // adding a break here fails to deliver the message ?
        console.log('sent to: ', client_id, client.id);
      }
    }
  }


}
