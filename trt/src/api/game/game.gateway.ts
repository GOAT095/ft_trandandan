import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/api/user/user.service';



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

const ENDSCORE : number = 5;

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
  socketID : string;

  constructor(ID : number, sID : string)
  {
    this.id = ID;
    this.socketID = sID;
  }

  isValidUser(): boolean
  {
    if (this.socketID == "NONE" || this.id == 0)
      return (false);
    return (true);
  }
};

class Room
{
  id : string;
  playerOne : User;
  playerTwo : User;
  spectators : string[];
  gameStates : GameState[];

  constructor()
  {
    this.id = RoomName + "1";
    RoomName = this.id;
    this.playerOne = new User(0, "NONE");
    this.playerTwo = new User(0, "NONE");
    this.gameStates = new Array<GameState>();
    this.gameStates.push(new GameState());
    this.spectators = new Array<string>();
  }

  reInitializeGameState(): void
  {
    this.gameStates = new Array<GameState>();
    this.gameStates.push(new GameState());
  }
};


@WebSocketGateway({namespace: 'GAME', cors:{ origin: '*', }})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger : Logger;
  private users : User[];
 
  constructor(public jwt : JwtService, public user : UserService) {}
  
  private server : Server;
  private rooms : Room[];

  @WebSocketServer()
  afterInit(server: Server) {
    this.logger = new Logger("GameLogger");
    this.users = new Array<User>();
    this.server = server;
    this.rooms = new Array<Room>();
  }

  async handleConnection(client: Socket, ...args: any[]) {
    //TODO(yassine) : Get The User ID Here.
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
        let newUser : User = new User(user.id, client.id);
        this.users.push(newUser);
      }
    }
  }

  handleDisconnect(client: Socket) {
  
    let roomIndex : number = 0; 
    for (; roomIndex < this.rooms.length; ++roomIndex)
    {
      //SPECTATOR
      for (let specIndex : number = 0; specIndex < this.rooms[roomIndex].spectators.length; specIndex++)
      {
        if (client.id == this.rooms[roomIndex].spectators[specIndex])
        {
          client.leave(this.rooms[roomIndex].id);
          this.rooms[roomIndex].spectators.splice(specIndex, 1);
        }
      }

      //PLAYER

      //case nobody joined the game nothing to be done


      //case you quit within the game.


      //case you quit after the game ended.
    }

  }

  @SubscribeMessage('RequestGame')
  handleRequestGame(client: Socket, userID : string) : void
  {

    //check if the socket id exists in the users table first.
   
  }

  @SubscribeMessage('SpectateGameRequest')
  handleSpectateGame(client: Socket, roomId: string) : void
  {
    for (let roomIndex : number = 0; roomIndex < this.rooms.length; roomIndex++)
    {
      if (this.rooms[roomIndex].id == roomId)
      {
        this.rooms[roomIndex].spectators.push(client.id);
        client.join(this.rooms[roomIndex].id);
      }
    }
  }

  @SubscribeMessage('connectionMSG')
  handleMessage(client: Socket, type: string): void
  {
    let userIndex : number = 0;
    for (; this.users.length; userIndex++)
    {
      if (this.users[userIndex].socketID == client.id)
        break;
     }
     if (userIndex == this.users.length)
    {
      client.disconnect();
      return ;
    }

    let userAddedToRoom : boolean = false;
    let roomIndex : number = 0;
    for ( ; roomIndex < this.rooms.length; ++roomIndex)
    {
      if (!this.rooms[roomIndex].playerOne.isValidUser())
      {
        this.rooms[roomIndex].playerOne.id = this.users[userIndex].id;
        this.rooms[roomIndex].playerOne.socketID = this.users[userIndex].socketID;
        client.join(this.rooms[roomIndex].id);
        userAddedToRoom = true;
        break;
      }
      if (!this.rooms[roomIndex].playerTwo.isValidUser())
      {
        this.rooms[roomIndex].playerTwo.id = this.users[userIndex].id;
        this.rooms[roomIndex].playerTwo.socketID = this.users[userIndex].socketID;
        client.join(this.rooms[roomIndex].id);
        userAddedToRoom = true;
        break;
      }
    }
    if (!userAddedToRoom)
    {
      let room : Room = new Room();
      room.playerOne.id = this.users[userIndex].id;
      room.playerOne.socketID = this.users[userIndex].socketID;
      this.rooms.push(room);
      roomIndex = this.rooms.length - 1;
      client.join(this.rooms[roomIndex].id);
    }
    if (this.rooms[roomIndex].playerOne.id != 0 &&
      this.rooms[roomIndex].playerTwo.id != 0)
      {
        this.rooms[roomIndex].reInitializeGameState();
        this.server.to(this.rooms[roomIndex].id).emit('ClientMSG', this.rooms[roomIndex].gameStates[0]);
      }

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
        if (this.rooms[roomIndex].playerOne.socketID == client.id)
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
        if (this.rooms[roomIndex].playerTwo.socketID == client.id)
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
        if (currentState.gameStart == true && client.id == this.rooms[roomIndex].playerOne.socketID)
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
              client.disconnect();
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
              client.disconnect();
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
        }
    }    
  }
}
