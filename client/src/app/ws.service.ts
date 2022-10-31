import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

  constructor() { }
}
