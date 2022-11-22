import { SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RoomService } from 'src/api/chat/room/room.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/api/user/user.service';

@WebSocketGateway({cors: {origin: '*'}})
export class WsGateway {

  constructor(public room: RoomService, public jwt: JwtService, public user: UserService) {}

  @WebSocketServer()
  private server: Server;

  clients = [];

  // TODO:
  //  ~ get user from auth (jwt)
  //  ~ check if user is the database !
  //  - better logging
  async handleConnection(client: any) {
    console.log('new client', client.id);
    console.log('client token', client.handshake.auth.token);
    if (client.handshake.auth.token == null) {
      return;
    }
    let payload : any = (this.jwt.decode(client.handshake.auth.token));
    if (payload.id != client.handshake.auth.id) {
      client.disconnect();
    }
    else {
      let user = await this.user.getUserByid(payload.id);
      if (user == null) {
        client.disconnect();
      }
      else {
        this.clients.push(client)
      }
    }
  }

  handleDisconnect(client: any) {
    this.clients.splice(this.clients.indexOf(client));
    //console.log('disconnected client', client.id);
  }

  broadcast(event: string, data: any) {
    for (let client of this.clients) {
      client.emit(event, data);
      //console.log("sent to : ", client.id)
    }
  }

  //@SubscribeMessage('message')
  //handleMessage(client: any, payload: any): string {
  //  console.log("foobar");
  //  return 'Hello world!';
  //}

  // TODO: send to only the receiver !
  // payload = {
  //  receiver: `player`: object,
  //  notification: `notification` : string
  // }
  @SubscribeMessage('notification')
  handleNotification(client: any, payload: any) {
    //console.log(payload);
    let receiver = payload.receiver.id;
    if (receiver == null) {
      return; // ?
    }
    for (let client of this.clients) {
      let client_id = client.handshake.auth.id;
      if (client_id == receiver) {
        client.emit('notification', payload);
      }
    }
    //this.broadcast('notification', payload);
  }

  // Global chat handler
  @SubscribeMessage('chatMessage')
  handleChatMessage(client: any, payload: any) {
    //console.log(payload);
    this.broadcast('chatMessage', payload);
  }

  // Group chat handler (Room/Channel)
  @SubscribeMessage('roomChatMessage')
  handleRoomChatMessage(client: any, payload: any) {
    console.log(payload);
    let room = this.room.findById(payload.room.id);
    // TODO:
    //  ~ check if is a member 
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

  // Direct Message handler
  @SubscribeMessage('directMessage')
  handleDirectMessage(client: any, payload: any) {
    console.log(payload);
    let receiver = payload.receiver.id;
    // TODO:
    //  ~ check if is a member 
    // Broadcast to connected clients which are members
    for (let client of this.clients) {
      //client.emit('', data);
      //console.log("sent to : ", client.id)
      let client_id = client.handshake.auth.id;
      if (client_id == receiver) {
        client.emit('directMessage', payload);
        // break; // adding a break here fails to deliver the message ?
        //console.log('sent to: ', client_id, client.id);
      }
    }
  }


}
