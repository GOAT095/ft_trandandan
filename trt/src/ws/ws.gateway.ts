import { SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({cors: {origin: '*'}})
export class WsGateway {

  @WebSocketServer()
  private server: Server;

  clients = [];

  handleConnection(client: any) {
    this.clients.push(client)
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
}
