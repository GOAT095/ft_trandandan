import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Logger, Inject} from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/api/user/user.service';
import { RoomDto } from '../dto/user.dto';
import { runInThisContext } from 'vm';
import { throwIfEmpty } from 'rxjs';
import { UserStatus } from '../user/user.status.enum';
import { roomUser } from '../chat/roomUser.entity';



function toRadians(angle : number) : number
{
    return (angle * Math.PI/ 180.0);
}

function addV3(left : [number, number, number] , right : [number, number, number]) : [number, number, number]
{
    return ([left[0] + right[0], left[1] + right[1], left[2] + right[2]]);
}

function subV3(left : [number, number, number], right : [number, number, number]) : [number, number, number]
{
    return ([left[0] - right[0], left[1] - right[1], left[2] - right[2]]);
}

function mulV3(left : [number, number, number], right : [number, number, number]) : [number, number, number]
{
    return ([left[0] * right[0], left[1] * right[1], left[2] * right[2]]);
}

function mulV3f(left : [number, number, number], right : number) : [number, number, number]
{
    return ([left[0] * right, left[1] * right, left[2] * right]);
}

function dotV3(left : [number, number, number], right : [number, number, number]) : number
{
    return ((left[0] * right[0]) + (left[1] * right[1]) + (left[2] * right[2]));
}

function crossV3(left : [number, number, number], right : [number, number, number]) : [number, number, number]
{
    return ([(left[1] * right[2]) - (left[2] * right[1]),
    (left[2] * right[0]) - (left[0] * right[2]),
    (left[0] * right[1]) - (left[1] * right[0])
    ]);
}

function lenV3(vec : [number, number, number]) : number
{
    return (Math.sqrt(dotV3(vec, vec)));
}

function normalizeV3(vec : [number, number, number]) : [number, number, number]
{
    const len = lenV3(vec);
    return ([vec[0] / len, vec[1] / len, vec[2] / len]);
}


type KeyState = 
{
  action: string;
  state: string;
};

enum Serve
{
  PONE = 0,
  PTWO
};

enum Winner
{
  NONE = 0,
  PONE,
  PTWO
};

enum Player
{
  NONE = 0,
  PONE,
  PTWO,
  BOTH
}

const ENDSCORE : number = 3;

type State = {
  _keyStates : KeyState[];
  gameState : GameState;
};

const ballRadius : number = 5.0;

const FRAMES_PER_SECOND : number = 60;
const TICK_UPDATE : number = 1 / FRAMES_PER_SECOND;
const paddleMovementStep : number = 200;
const paddleDimensions : [number, number, number] = [5.0, 5.0, 32.0];
const fieldDimensions : [number, number, number] = [512.0, 0.1, 256.0];

const ballMovementStep : number = 300;

function inverseServingPlayer(state : GameState) : GameState
{
  if (state.serve == Serve.PONE)
  {
    state.serve = Serve.PTWO;
    state.ballPosition = [state.p2Position[0]  - (ballRadius * 2.0), state.p2Position[1], state.p2Position[2]];
    state.ballDirection = [-1.0, 0.0, 0.0];
  }
  else
  {
    state.serve = Serve.PONE;
    state.ballPosition = [state.p1Position[0] + (ballRadius * 2.0), state.p1Position[1], state.p1Position[2]];
    state.ballDirection = [1.0, 0.0, 0.0];
  }
  return state;
}

function equalStates(state1: GameState, state2: GameState) : boolean
{
  for (let i : number = 0; i < 3; ++i)
  {
    if (state1.p1Position[i] != state2.p1Position[i])
      return (false);
    if (state1.p2Position[i] != state2.p2Position[i])
      return (false);
    if (state1.ballPosition[i] != state2.ballPosition[i])
      return (false);
    
    if (i < 2)
    {
      if (state1.score[i] != state2.score[i])
        return (false);
    }
  }
  if (state1.serve != state2.serve)
    return (false);
  if (state1.gameStart != state2.gameStart)
    return (false);
  
  return (true);
}

class GameState
{
  p1Position : [number, number, number];
  p2Position : [number, number, number];
  ballPosition : [number, number, number];
  ballDirection : [number, number, number];
  score : [number, number];
  serve : Serve;
  gameStart : boolean;
  winner : Winner;
  // player : Player;

  constructor()
  {
    this.p1Position = [-fieldDimensions[0] / 2.0, 0.0, 0.0];
    this.p2Position = [fieldDimensions[0] / 2.0, 0.0, 0.0];
    this.score = [0.0, 0.0];
    this.serve = Serve.PONE;
    this.gameStart = false;
    if (this.serve == Serve.PONE)
    {
      this.ballPosition = [(-fieldDimensions[0] * 0.5) + (ballRadius * 2.0), 0.0, 0.0];
      this.ballDirection = [1.0, 0.0, 0.0];
    }
    else
    {
      this.ballPosition = [(fieldDimensions[0] * 0.5) - (ballRadius * 2.0), 0.0, 0.0];
      this.ballDirection = [-1.0, 0.0, 0.0];
    }
    this.winner = Winner.NONE;
    // this.player = Player.PONE;
  }
};


let RoomName : string = "ROOM";

class User
{
  id : number;
  socket : Socket;

  constructor(ID : number, s : Socket)
  {
    this.id = ID;
    this.socket = s;
  }

  isValidUser(): boolean
  {
    if (this.socket != null && this.id != 0)
      return (true);
    return (false);
  }
};

class Room
{
  id : string;
  playerOne : User;
  playerTwo : User;
  spectators : Socket[];
  gameStates : GameState[];

  constructor()
  {
    this.id = RoomName + "1";
    RoomName = this.id;
    this.playerOne = new User(0, null);
    this.playerTwo = new User(0, null);
    this.gameStates = new Array<GameState>();
    this.gameStates.push(new GameState());
    this.spectators = new Array<Socket>();
  }

  reInitializeGameState(): void
  {
    this.gameStates = new Array<GameState>();
    this.gameStates.push(new GameState());

  }

  playersValid() : Player
  {
    let result : Player = Player.NONE;
    if (this.playerOne.isValidUser() && this.playerTwo.isValidUser())
      result = Player.BOTH;
    else if (this.playerOne.isValidUser() && !this.playerTwo.isValidUser())
      result = Player.PONE;
    else if (this.playerTwo.isValidUser() && !this.playerOne.isValidUser())
      result = Player.PTWO;
    return (result);
  }
};


class RoomBroadcast
{
  id : string;
  player1ID : number;
  player2ID : number;
};

@WebSocketGateway({namespace: "GAME", cors:{ origin: '*', }})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @Inject(UserService)
  private readonly userService: UserService;
  @Inject(JwtService)
  private readonly jwt: JwtService;

  private broadcastArray : RoomBroadcast[];
  
  private logger : Logger;
  private users : User[];
  
  private server : Server;
  private rooms : Room[];

  private privateRooms : Room[];


deleteAllSpectators(room : Room) : void
{
  if (room.spectators !== undefined || room.spectators !== null)
  {
    for (let specIndex : number = 0; specIndex < room.spectators.length; specIndex++)
    {
      room.spectators[specIndex].leave(room.id);
      room.spectators[specIndex].disconnect();
    }
  }
}

  @WebSocketServer()
  afterInit(server: Server) {
    this.logger = new Logger("GameLogger");
    this.users = new Array<User>();
    this.server = server;
    this.rooms = new Array<Room>();
    this.privateRooms = new Array<Room>();
  }

  async handleConnection(client: Socket, ...args: any[]) {
  
    let payload : any = (this.jwt.decode(client.handshake.auth.token));
    if (payload == null)
    {

      client.disconnect();
      return ;
    }
    if (payload.id != client.handshake.auth.id) {

      client.disconnect();
    }
    else {
      // this.logger.debug(payload.id);
      let user = await this.userService.getUserByid(payload.id);
      if (user == null) {

        client.disconnect();
      }
      else {
        let newUser : User = new User(user.id, client);
        this.users.push(newUser);
        // for (let userIndex : number = 0; userIndex < this.users.length; userIndex++)
        // {
        //   this.logger.debug(this.users[userIndex].id + ", " + this.users[userIndex].socket.id);
        // }
        return ;
      }
    }
  
  }

  async handleDisconnect(client: Socket) {
    for (let roomIndex : number = 0; roomIndex < this.rooms.length; roomIndex++)
    {
      if (this.rooms[roomIndex].spectators)
      {
        for (let specIndex : number = 0; specIndex < this.rooms[roomIndex].spectators.length; specIndex++) 
        {
          if (client.id == this.rooms[roomIndex].spectators[specIndex].id)
          {
            this.rooms[roomIndex].spectators[specIndex].leave(this.rooms[roomIndex].id);
            this.rooms[roomIndex].spectators.splice(specIndex, 1);
            return ;
          }
        }
      }
      if (this.rooms[roomIndex].playersValid() == Player.BOTH)
      {
        if (client.id == this.rooms[roomIndex].playerOne.socket.id)
        {
          if (this.rooms[roomIndex].gameStates[0].winner == Winner.NONE)
          {
            this.server.to(this.rooms[roomIndex].id).emit("END", this.rooms[roomIndex].playerTwo.id);
            this.rooms[roomIndex].gameStates[0].winner == Winner.PTWO;
          }

          
            if (this.rooms[roomIndex].gameStates[0].winner == Winner.PTWO)
            {
              this.userService.addwin(this.rooms[roomIndex].playerTwo.id);
              this.userService.addloss(this.rooms[roomIndex].playerOne.id);
            }
            else
            {
              this.userService.addwin(this.rooms[roomIndex].playerOne.id);
              this.userService.addloss(this.rooms[roomIndex].playerTwo.id);
            }

            this.userService.saveHistory(this.rooms[roomIndex].playerOne.id, this.rooms[roomIndex].playerTwo.id, this.rooms[roomIndex].gameStates[0].score[0], this.rooms[roomIndex].gameStates[0].score[1]);
            this.userService.updateStatus(this.rooms[roomIndex].playerOne.id, UserStatus.online);
            this.userService.updateStatus(this.rooms[roomIndex].playerTwo.id, UserStatus.online);

          client.leave(this.rooms[roomIndex].id);
          let sock : Socket = this.rooms[roomIndex].playerTwo.socket;
          this.rooms[roomIndex].playerOne.id = 0;
          this.rooms[roomIndex].playerOne.socket = null;
          if (sock)
            sock.disconnect();
          return ;
        }
        else if (client.id == this.rooms[roomIndex].playerTwo.socket.id)
        {
          if (this.rooms[roomIndex].gameStates[0].winner == Winner.NONE)
          {
            this.server.to(this.rooms[roomIndex].id).emit("END", this.rooms[roomIndex].playerOne.id);
            this.rooms[roomIndex].gameStates[0].winner == Winner.PONE;
          }
           
            if (this.rooms[roomIndex].gameStates[0].winner == Winner.PTWO)
            {
              this.userService.addwin(this.rooms[roomIndex].playerTwo.id);
              this.userService.addloss(this.rooms[roomIndex].playerOne.id);
            }
            else
            {
              this.userService.addwin(this.rooms[roomIndex].playerOne.id);
              this.userService.addloss(this.rooms[roomIndex].playerTwo.id);
            }

            this.userService.saveHistory(this.rooms[roomIndex].playerOne.id, this.rooms[roomIndex].playerTwo.id, this.rooms[roomIndex].gameStates[0].score[0], this.rooms[roomIndex].gameStates[0].score[1]);
            this.userService.updateStatus(this.rooms[roomIndex].playerOne.id, UserStatus.online);
            this.userService.updateStatus(this.rooms[roomIndex].playerTwo.id, UserStatus.online);


          client.leave(this.rooms[roomIndex].id);
          let sock : Socket = this.rooms[roomIndex].playerTwo.socket;
          this.rooms[roomIndex].playerTwo.id = 0;
          this.rooms[roomIndex].playerTwo.socket = null;
          if (sock)
            sock.disconnect();
          return ;
        }
      }
      else if (this.rooms[roomIndex].playersValid() == Player.PONE ||
      this.rooms[roomIndex].playersValid() == Player.PTWO)
      {
        client.leave(this.rooms[roomIndex].id);
        this.deleteAllSpectators(this.rooms[roomIndex]);
        this.rooms.splice(roomIndex, 1);
        if (this.broadcastArray)
        {
          delete this.broadcastArray;
        }
        this.broadcastArray = new Array<RoomBroadcast>();
        
        for (let roomIndex : number = 0; roomIndex < this.rooms.length; roomIndex++)
        {
          let elem : RoomBroadcast = new RoomBroadcast();
          elem.id = this.rooms[roomIndex].id;
          elem.player1ID = this.rooms[roomIndex].playerOne.id;
          elem.player2ID = this.rooms[roomIndex].playerTwo.id;
          this.broadcastArray.push(elem);
        }
  
        this.server.emit("Rooms", this.broadcastArray);
        return ;
      }
    }
    //NOTE(yassine) : because I also get the chat sockets here.
    // for (let userIndex : number = 0; userIndex < this.users.length; userIndex)
    // {
    //   if (client.id == this.users[userIndex].socket.id)
    //     this.users.splice(userIndex, 1);
    // }
  }

  @SubscribeMessage('RequestGame')
  handleRequestGame(client: Socket, entry : [string, number]) : void
  {
    let roomIndex : number = 0;
    for (; roomIndex < this.privateRooms.length; roomIndex++)
    {
      if (this.privateRooms[roomIndex].id == entry[0])
        break;
    }
    let room : Room;
    if (roomIndex == this.privateRooms.length)
    {
      room = new Room();
      room.id = entry[0];
      this.privateRooms.push(room);
    }
    else
    {
      room.playerTwo.id = entry[1];
    }
    this.server.emit("pvpRoomID", room.id);
  }

  @SubscribeMessage('pvpConnectionRequest')
  handlePvPGame(client: Socket, entry : [string, number]) : void
  {
    let roomIndex : number = 0;
    for (; roomIndex < this.privateRooms.length; roomIndex++)
    {
      if (this.privateRooms[roomIndex].id = entry[0])
      {
        if (!this.privateRooms[roomIndex].playerOne.isValidUser())
        {
          this.logger.debug("p1");
          this.privateRooms[roomIndex].playerOne.id = entry[1];
          this.privateRooms[roomIndex].playerOne.socket = client;
          client.join(this.privateRooms[roomIndex].id);
          break;
        }
        if (!this.privateRooms[roomIndex].playerTwo.isValidUser())
        {
          this.logger.debug("p2");
          this.privateRooms[roomIndex].playerTwo.id = entry[1];
          this.privateRooms[roomIndex].playerTwo.socket = client;
          client.join(this.privateRooms[roomIndex].id);
          break;
        }
      }
    }

    if (roomIndex != this.privateRooms.length && this.privateRooms[roomIndex].playersValid() == Player.BOTH)
    {
      this.logger.debug("CONNECTED");

      let newRoom : Room = new Room();
      newRoom.id = this.privateRooms[roomIndex].id;
      newRoom.playerOne.id = this.privateRooms[roomIndex].playerOne.id;
      newRoom.playerOne.socket = this.privateRooms[roomIndex].playerOne.socket;
      newRoom.playerTwo.id = this.privateRooms[roomIndex].playerTwo.id;
      newRoom.playerTwo.socket = this.privateRooms[roomIndex].playerTwo.socket;
      
      
      this.privateRooms.splice(roomIndex, 1);
      this.rooms.push(newRoom);

      this.rooms[this.rooms.length - 1].reInitializeGameState();
      // this.userService.updateStatus(this.rooms[this.rooms.length - 1].playerOne.id, UserStatus.ingame);
      // this.userService.updateStatus(this.rooms[this.rooms.length - 1].playerTwo.id, UserStatus.ingame);
      this.server.to(this.rooms[this.rooms.length - 1].id).emit('ClientMSG', this.rooms[this.rooms.length - 1].gameStates[0]);
      this.server.to(this.rooms[this.rooms.length - 1].id).emit('PlayerIds', [this.rooms[this.rooms.length - 1].playerOne.id, this.rooms[roomIndex].playerTwo.id]);
    }
  }

  // @SubscribeMessage('RequestPlayerStatus')
  // handleStates(client: Socket, userID : number) : void
  // {
  //   for (let roomIndex : number = 0; roomIndex < this.rooms.length; roomIndex++)
  //   {
  //     if (this.rooms[roomIndex].playersValid() == Player.BOTH &&
  //     this.rooms[roomIndex].playerOne.id == userID ||
  //     this.rooms[roomIndex].playerTwo.id == userID)
  //     {
  //       this.server.emit("PlayerStatus", "INGAME");
  //       return ;
  //     }
  //     else if ((this.rooms[roomIndex].playersValid() == Player.PONE &&
  //     this.rooms[roomIndex].playerOne.id == userID) ||
  //     (this.rooms[roomIndex].playersValid() == Player.PTWO && this.rooms[roomIndex].playerTwo.id == userID))
  //     {
  //       this.server.emit("PlayerStatus", "ONLINE");
  //       return ;
  //     }
  //   }
  //   for (let userIndex : number = 0; userIndex < this.users.length; userIndex++)
  //   {
  //     if (this.users[userIndex].isValidUser() && userID == this.users[userIndex].id)
  //     {
  //       this.server.emit("PlayerStatus", "ONLINE");
  //       return ;
  //     }
  //   }

  //   this.server.emit("PlayerStatus", "OFFLINE");
  // }

  @SubscribeMessage('SpectateGameRequest')
  handleSpectateGame(client: Socket, roomId: string) : void
  {
    for (let roomIndex : number = 0; roomIndex < this.rooms.length; roomIndex++)
    {
      if (this.rooms[roomIndex].id == roomId)
      {
        this.rooms[roomIndex].spectators.push(client);
        client.join(this.rooms[roomIndex].id);
      }
    }
  }

  @SubscribeMessage('ListRooms')
  handleListRooms(client: Socket)
  {
    if (this.broadcastArray)
    {
      delete this.broadcastArray;
    }
    this.broadcastArray = new Array<RoomBroadcast>();
    //TODO(yassine) : do this in an other place
    for (let roomIndex : number = 0; roomIndex < this.rooms.length; roomIndex++)
    {
      let elem : RoomBroadcast = new RoomBroadcast();
      elem.id = this.rooms[roomIndex].id;
      elem.player1ID = this.rooms[roomIndex].playerOne.id;
      elem.player2ID = this.rooms[roomIndex].playerTwo.id;
      this.broadcastArray.push(elem);
    }

    // this.logger.debug("handleListRooms:Get");
    this.server.emit("Rooms", this.broadcastArray);

  }

  @SubscribeMessage('connectionMSG')
  handleMessage(client: Socket, type: string): void
  {
    //add the user the first available room.
    let userIndex : number = 0;
    for (; userIndex < this.users.length; userIndex++)
    {
      if (this.users[userIndex].socket.id == client.id)
        break;
    }
    if (userIndex == this.users.length)
    {
      client.disconnect();
      return;
    }
    let newUser : User = new User(this.users[userIndex].id, this.users[userIndex].socket);
    
    let roomIndex : number = 0;
    let playerAdded : boolean = false;
    for (; roomIndex < this.rooms.length; roomIndex++)
    {
      if (!this.rooms[roomIndex].playerOne.isValidUser())
      {    
        this.rooms[roomIndex].playerOne = newUser;
        client.join(this.rooms[roomIndex].id);
        playerAdded = true;
        if (this.broadcastArray)
        {
          delete this.broadcastArray;
        }
        this.broadcastArray = new Array<RoomBroadcast>();
        
        for (let roomIndex : number = 0; roomIndex < this.rooms.length; roomIndex++)
        {
          let elem : RoomBroadcast = new RoomBroadcast();
          elem.id = this.rooms[roomIndex].id;
          elem.player1ID = this.rooms[roomIndex].playerOne.id;
          elem.player2ID = this.rooms[roomIndex].playerTwo.id;
          this.broadcastArray.push(elem);
        }
  
        this.server.emit("Rooms", this.broadcastArray);
        this.users.splice(userIndex, 1);
        break;
      }
      if (!this.rooms[roomIndex].playerTwo.isValidUser())
      {
        this.rooms[roomIndex].playerTwo = newUser;
        client.join(this.rooms[roomIndex].id);
        if (this.broadcastArray)
        {
          delete this.broadcastArray;
        }
        this.broadcastArray = new Array<RoomBroadcast>();
        
        for (let roomIndex : number = 0; roomIndex < this.rooms.length; roomIndex++)
        {
          let elem : RoomBroadcast = new RoomBroadcast();
          elem.id = this.rooms[roomIndex].id;
          elem.player1ID = this.rooms[roomIndex].playerOne.id;
          elem.player2ID = this.rooms[roomIndex].playerTwo.id;
          this.broadcastArray.push(elem);
        }
  
        this.server.emit("Rooms", this.broadcastArray);
        playerAdded = true;
        this.users.splice(userIndex, 1);
        break;
      }
    }
    if (!playerAdded)
    {
      let room : Room = new Room();
      room.playerOne = newUser;
      this.rooms.push(room);


     
      this.logger.debug("ROOMS UPDATED");
      if (this.broadcastArray)
      {
        delete this.broadcastArray;
      }
      this.broadcastArray = new Array<RoomBroadcast>();
      
      for (let roomIndex : number = 0; roomIndex < this.rooms.length; roomIndex++)
      {
        let elem : RoomBroadcast = new RoomBroadcast();
        elem.id = this.rooms[roomIndex].id;
        elem.player1ID = this.rooms[roomIndex].playerOne.id;
        elem.player2ID = this.rooms[roomIndex].playerTwo.id;
        this.broadcastArray.push(elem);
      }

      this.server.emit("Rooms", this.broadcastArray);
      this.logger.debug("ROOMS UPDATED");
      this.logger.warn("ROOMS UPDATED");
      roomIndex = this.rooms.length - 1;
      client.join(this.rooms[roomIndex].id);
      this.users.splice(userIndex, 1);
    }
    if (this.rooms[roomIndex].playerOne.isValidUser() && this.rooms[roomIndex].playerTwo.isValidUser())
    {
      this.rooms[roomIndex].reInitializeGameState();
      this.userService.updateStatus(this.rooms[roomIndex].playerOne.id, UserStatus.ingame);
      this.userService.updateStatus(this.rooms[roomIndex].playerTwo.id, UserStatus.ingame);
      this.server.to(this.rooms[roomIndex].id).emit('ClientMSG', this.rooms[roomIndex].gameStates[0]);
      this.server.to(this.rooms[roomIndex].id).emit('PlayerIds', [this.rooms[roomIndex].playerOne.id, this.rooms[roomIndex].playerTwo.id]);
      this.logger.warn("PlayerIds UPDATED");
    }

    // for (let rIndex : number = 0; rIndex < this.rooms.length; rIndex++)
    // {
    //   this.logger.debug("ROOM ID : " + this.rooms[rIndex].id);
    //   if (this.rooms[rIndex].playerOne.isValidUser())
    //     this.logger.debug("P1 : " + this.rooms[rIndex].playerOne.id + ", " + this.rooms[rIndex].playerOne.socket.id);
    //   if (this.rooms[rIndex].playerTwo.isValidUser())
    //     this.logger.debug("P2 : " + this.rooms[rIndex].playerTwo.id + ", " + this.rooms[rIndex].playerTwo.socket.id);
    //   for (let specIndex : number = 0; specIndex < this.rooms[rIndex].spectators.length; specIndex++)
    //     this.logger.debug("Spec :" + this.rooms[rIndex].spectators[specIndex].id);
    //   this.logger.debug("Users who didn't join a Game");
    //   for (let userIndex : number = 0; userIndex < this.users.length; userIndex++)
    //   {
    //     this.logger.debug(this.users[userIndex].id + ", " + this.users[userIndex].socket.id);
    //   }
    //   this.logger.debug("_____________________________________");
    // }

      //NOTE(Yassine) : OLD CODE.
      // if (type == "PLAYER")
    // {
    //   let clientAddedToRoom : boolean = false;
    //   let roomIndex : number = 0;
    //   for ( ; roomIndex < this.rooms.length; ++roomIndex)
    //   {
    //     if (this.rooms[roomIndex].playerOne == "PLAYERONE")
    //     {
    //       this.rooms[roomIndex].playerOne = client.id;
    //       client.join(this.rooms[roomIndex].name);
    //       client.to(this.rooms[roomIndex].name).emit('PlayerRole', Player.PONE);
    //       clientAddedToRoom = true;
    //       break;
    //     }
    //     if (this.rooms[roomIndex].playerTwo == "PLAYERTWO")
    //     {
    //       this.rooms[roomIndex].playerTwo = client.id;
    //       client.join(this.rooms[roomIndex].name);
    //       client.to(this.rooms[roomIndex].name).emit('PlayerRole', Player.PTWO);
    //       clientAddedToRoom = true;
    //       break;
    //     }
    //   }
    //   if (!clientAddedToRoom)
    //   {
    //     let room : Room = new Room();
    //     room.playerOne = client.id;
    //     this.rooms.push(room);
    //     roomIndex = this.rooms.length - 1;
    //     client.join(this.rooms[roomIndex].name);
    //     client.to(this.rooms[roomIndex].name).emit('PlayerRole', Player.PONE);
    //   }
    //   if (this.rooms[roomIndex].playerOne != "PLAYERONE" && this.rooms[roomIndex].playerTwo != "PLAYERTWO")
    //   {
    //     this.rooms[roomIndex].reInitializeGameState();
    //     this.server.to(this.rooms[roomIndex].name).emit('ClientMSG', this.rooms[roomIndex].gameStates[0]);
    //   }
    // }
  }

  @SubscribeMessage('keysState')
  handleGameLogic(client : Socket,  state: State) : void
  {
    let keyStates : KeyState[] = state[0];
    let inState : GameState = state[1];
    for (let roomIndex : number = 0; roomIndex < this.rooms.length; roomIndex++)
    {
      let currentState : GameState = this.rooms[roomIndex].gameStates[this.rooms[roomIndex].gameStates.length - 1];
      if (currentState.winner == Winner.NONE)
      {
        if (this.rooms[roomIndex].playerOne.isValidUser() && this.rooms[roomIndex].playerOne.socket.id == client.id)
        {
          if (keyStates[2].state == "DOWN" &&
          currentState.gameStart == false &&
          currentState.serve == Serve.PONE)
          {
            currentState.gameStart = true;
          }
          // UP Key
          if (keyStates[0].state == "DOWN")
          {
            currentState.p1Position[2] += (paddleMovementStep * TICK_UPDATE);
            if (currentState.p1Position[2] + (paddleDimensions[2] / 2.0) > (fieldDimensions[2] / 2.0))
              currentState.p1Position[2] = (fieldDimensions[2] / 2.0) - (paddleDimensions[2] / 2.0);
          }
          // DOWN Key
          if (keyStates[1].state == "DOWN")
          {
            currentState.p1Position[2] -= (paddleMovementStep * TICK_UPDATE);
            if (currentState.p1Position[2] - (paddleDimensions[2] / 2.0) < -(fieldDimensions[2] / 2.0))
              currentState.p1Position[2] = (-fieldDimensions[2] / 2.0) - (-paddleDimensions[2] / 2.0);
          }
          if (currentState.gameStart == false && currentState.serve == Serve.PONE)
          {
            if (keyStates[0].state == "DOWN")
            {
              currentState.ballPosition[2] += (paddleMovementStep * TICK_UPDATE);
              if (currentState.ballPosition[2] + (paddleDimensions[2] / 2.0) > (fieldDimensions[2] / 2.0))
                currentState.ballPosition[2] = (fieldDimensions[2] / 2.0) - (paddleDimensions[2] / 2.0);
            }
            if (keyStates[1].state == "DOWN")
            {
              currentState.ballPosition[2] -= (paddleMovementStep * TICK_UPDATE);
              if (currentState.ballPosition[2] - (paddleDimensions[2] / 2.0) < -(fieldDimensions[2] / 2.0))
                currentState.ballPosition[2] = (-fieldDimensions[2] / 2.0) - (-paddleDimensions[2] / 2.0);
            }
          }
        }
        if (this.rooms[roomIndex].playerTwo.isValidUser() && this.rooms[roomIndex].playerTwo.socket.id == client.id)
        {
          if (keyStates[2].state == "DOWN" &&
          currentState.gameStart == false &&
          currentState.serve == Serve.PTWO)
          {
            currentState.gameStart = true;
          }
          //UPKEY
          if (keyStates[0].state == "DOWN")
          {
            currentState.p2Position[2] += (paddleMovementStep * TICK_UPDATE);
            if (currentState.p2Position[2] + (paddleDimensions[2] / 2.0) > (fieldDimensions[2] / 2.0))
              currentState.p2Position[2] = (fieldDimensions[2] / 2.0) - (paddleDimensions[2] / 2.0);
          }
          //
          if (keyStates[1].state == "DOWN")
          {
            currentState.p2Position[2] -= (paddleMovementStep * TICK_UPDATE);
            if (currentState.p2Position[2] - (paddleDimensions[2] / 2.0) < -(fieldDimensions[2] / 2.0))
              currentState.p2Position[2] = (-fieldDimensions[2] / 2.0) - (-paddleDimensions[2] / 2.0);
          }
          if (currentState.gameStart == false && currentState.serve == Serve.PTWO)
          {
            if (keyStates[0].state == "DOWN")
            {
              currentState.ballPosition[2] += (paddleMovementStep * TICK_UPDATE);
              if (currentState.ballPosition[2] + (paddleDimensions[2] / 2.0) > (fieldDimensions[2] / 2.0))
                currentState.ballPosition[2] = (fieldDimensions[2] / 2.0) - (paddleDimensions[2] / 2.0);
            }
            if (keyStates[1].state == "DOWN")
            {
              currentState.ballPosition[2] -= (paddleMovementStep * TICK_UPDATE);
              if (currentState.ballPosition[2] - (paddleDimensions[2] / 2.0) < -(fieldDimensions[2] / 2.0))
                currentState.ballPosition[2] = (-fieldDimensions[2] / 2.0) - (-paddleDimensions[2] / 2.0);
            }
          }
        }
        if (currentState.gameStart == true && client.id == this.rooms[roomIndex].playerOne.socket.id)
        {
          currentState.ballPosition = addV3(mulV3f(currentState.ballDirection, ballMovementStep * TICK_UPDATE), currentState.ballPosition);
          if (currentState.ballPosition[0] < (-fieldDimensions[0] / 2.0) - (3.0 * ballRadius))
          {
            currentState.gameStart = false;
            currentState = inverseServingPlayer(currentState);
            currentState.score[1]++;
            if (currentState.score[1] >= ENDSCORE)
            {
              currentState.winner = Winner.PTWO;
              this.server.to(this.rooms[roomIndex].id).emit("END", this.rooms[roomIndex].playerTwo.id);

            }
          }
          if (currentState.ballPosition[0] > (fieldDimensions[0] / 2.0) + (3.0 * ballRadius))
          {
            currentState.gameStart = false;
            currentState = inverseServingPlayer(currentState);
            currentState.score[0]++;
            if (currentState.score[0] >= ENDSCORE)
            {
              currentState.winner = Winner.PONE;
              this.server.to(this.rooms[roomIndex].id).emit("END", this.rooms[roomIndex].playerOne.id);
            }
          }
          if (currentState.ballPosition[2] + ballRadius > fieldDimensions[2] / 2.0)
          {
              currentState.ballPosition[2] = (fieldDimensions[2] / 2.0) - ballRadius;
              currentState.ballDirection[2] *= -1.0;
          }
          if (currentState.ballPosition[2] - ballRadius < -fieldDimensions[2] / 2.0)
          {
              currentState.ballPosition[2] = (-fieldDimensions[2] / 2.0) + ballRadius;
              currentState.ballDirection[2] *= -1.0;
          }
          if (dotV3(currentState.ballDirection, [1.0, 0.0, 0.0]) > 0)
          {
              const nearZ = Math.max(currentState.p2Position[2] - (paddleDimensions[2] / 2.0), Math.min(currentState.ballPosition[2], currentState.p2Position[2] + (paddleDimensions[2] / 2.0)));
              const nearX = Math.max(currentState.p2Position[0] - (paddleDimensions[0] / 2.0), Math.min(currentState.ballPosition[0], currentState.p2Position[0] + (paddleDimensions[0] / 2.0)));
              const nearestPointOnPaddle : [number, number, number] = [nearX, 0.0, nearZ];
              const ballNearestVec = subV3(nearestPointOnPaddle, currentState.ballPosition);
              const dot = dotV3(ballNearestVec, ballNearestVec);
              if (dot < ballRadius * ballRadius)
              {
                  // ballPosition = addV3(nearestPointOnPaddle, mulV3f(ballDirection, -ballRadius));
                  if (nearestPointOnPaddle[0] > currentState.p2Position[0] + (paddleDimensions[0] * 0.5))
                      nearestPointOnPaddle[0] = currentState.p2Position[0] + (paddleDimensions[0] * 0.5);
                //  this.gameState.p2Position[0] += 5.0;
                  const reflectionVec = subV3(nearestPointOnPaddle, [currentState.p2Position[0] + 5.0, currentState.p2Position[1], currentState.p2Position[2]]);
                  currentState.ballDirection = [reflectionVec[0], reflectionVec[1], reflectionVec[2]];
                  currentState.ballDirection = normalizeV3(currentState.ballDirection);
              }
          }
          else
          {
            const nearZ = Math.max(currentState.p1Position[2] - (paddleDimensions[2] / 2.0), Math.min(currentState.ballPosition[2], currentState.p1Position[2] + (paddleDimensions[2] / 2.0)));
            const nearX = Math.max(currentState.p1Position[0] - (paddleDimensions[0] / 2.0), Math.min(currentState.ballPosition[0], currentState.p1Position[0] + (paddleDimensions[0] / 2.0)));
            const nearestPointOnPaddle : [number, number, number] = [nearX, 0.0, nearZ];
            const ballNearestVec = subV3(nearestPointOnPaddle, currentState.ballPosition);
            const dot = dotV3(ballNearestVec, ballNearestVec);
            if (dot < ballRadius * ballRadius)
            {
                // ballPosition = addV3(nearestPointOnPaddle, mulV3f(ballDirection, -ballRadius));
                if (nearestPointOnPaddle[0] > currentState.p1Position[0] + (paddleDimensions[0] * 0.5))
                    nearestPointOnPaddle[0] = currentState.p1Position[0] + (paddleDimensions[0] * 0.5);
                // this.gameState.p1Position[0] -= 5.0;
                const reflectionVec = subV3(nearestPointOnPaddle, [currentState.p1Position[0] - 5.0, currentState.p1Position[1], currentState.p1Position[2]]);
                currentState.ballDirection = [reflectionVec[0], reflectionVec[1], reflectionVec[2]];
                currentState.ballDirection = normalizeV3(currentState.ballDirection);
            }
          }
        }
        this.rooms[roomIndex].gameStates.push(currentState);
        if (equalStates(inState, this.rooms[roomIndex].gameStates[0]) &&
        this.rooms[roomIndex].gameStates.length > 1)
        {
          this.rooms[roomIndex].gameStates.splice(0, 1);
        }
        this.server.to(this.rooms[roomIndex].id).emit('ClientMSG', this.rooms[roomIndex].gameStates[0]);
        this.server.to(this.rooms[roomIndex].id).emit('PlayerIds', [this.rooms[roomIndex].playerOne.id, this.rooms[roomIndex].playerTwo.id]);
        if (currentState.winner != Winner.NONE)
        {
          client.disconnect();
        }
        }
    }    
  }
}