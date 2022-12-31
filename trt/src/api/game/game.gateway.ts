import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';


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

enum Player
{
  PONE = 0,
  PTWO,
  SPECTATOR
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
  return state
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

class Room
{
  name : string;
  playerOne : string;
  playerTwo : string;
  spectators : string[];
  gameStates : GameState[];

  constructor()
  {
    this.name = RoomName + "1";
    RoomName = this.name;
    this.playerOne = "PLAYERONE";
    this.playerTwo = "PLAYERTWO";
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
  private socketIDs : string[];
  // private gameState : GameState;
  // private ball : Ball;
  private server : Server;
  private rooms : Room[];

  @WebSocketServer()
  afterInit(server: Server) {
    this.logger = new Logger("GameLogger");
    this.socketIDs = new Array<string>();
    this.server = server;
    this.rooms = new Array<Room>();
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.socketIDs.push(client.id);
    
  }

  handleDisconnect(client: Socket) {
    for (let i = 0; i < this.socketIDs.length; ++i)
    {
      if (this.socketIDs[i] == client.id)
        this.socketIDs.splice(i, 1);
    }
    for (let roomsIndex : number = 0; roomsIndex < this.rooms.length; ++roomsIndex)
    {
      if (this.rooms[roomsIndex].playerOne == client.id)
      {
        this.rooms[roomsIndex].playerOne = "PLAYERONE";
        this.rooms[roomsIndex].gameStates[0].gameStart = false;
      }
      if (this.rooms[roomsIndex].playerTwo == client.id)
      {
        this.rooms[roomsIndex].playerTwo = "PLAYERTWO";
        this.rooms[roomsIndex].gameStates[0].gameStart = false;
      }
      
    }
    for (let roomsIndex : number = 0; roomsIndex < this.rooms.length; ++roomsIndex)
    {
      if (this.rooms[roomsIndex].playerOne == "PLAYERONE" && this.rooms[roomsIndex].playerTwo == "PLAYERTWO")
        this.rooms.splice(roomsIndex, 1);
    }
    this.logger.debug(client.id);
    this.logger.debug("==============DISSCONECT==============");
    for (let roomIndex = 0; roomIndex < this.rooms.length; roomIndex++)
    {
      this.logger.debug("\n" + "\tIndex: " + roomIndex + "\n" +
                        "\tP1 Id : " + this.rooms[roomIndex].playerOne + "\n" +
                        "\tP2 Id : " + this.rooms[roomIndex].playerTwo + "\n");
    }
  }

  @SubscribeMessage('connectionMSG')
  handleMessage(client: Socket, type: string): void
  {
    if (type == "PLAYER")
    {
      let clientAddedToRoom : boolean = false;
      let roomIndex : number = 0;
      for ( ; roomIndex < this.rooms.length; ++roomIndex)
      {
        if (this.rooms[roomIndex].playerOne == "PLAYERONE")
        {
          this.rooms[roomIndex].playerOne = client.id;
          client.join(this.rooms[roomIndex].name);
          client.to(this.rooms[roomIndex].name).emit('PlayerRole', Player.PONE);
          clientAddedToRoom = true;
          break;
        }
        if (this.rooms[roomIndex].playerTwo == "PLAYERTWO")
        {
          this.rooms[roomIndex].playerTwo = client.id;
          client.join(this.rooms[roomIndex].name);
          client.to(this.rooms[roomIndex].name).emit('PlayerRole', Player.PTWO);
          clientAddedToRoom = true;
          break;
        }
      }
      if (!clientAddedToRoom)
      {
        let room : Room = new Room();
        room.playerOne = client.id;
        this.rooms.push(room);
        roomIndex = this.rooms.length - 1;
        client.join(this.rooms[roomIndex].name);
        client.to(this.rooms[roomIndex].name).emit('PlayerRole', Player.PONE);
      }
      if (this.rooms[roomIndex].playerOne != "PLAYERONE" && this.rooms[roomIndex].playerTwo != "PLAYERTWO")
      {
        this.rooms[roomIndex].reInitializeGameState();
        this.server.to(this.rooms[roomIndex].name).emit('ClientMSG', this.rooms[roomIndex].gameStates[0]);
      }
    }
    this.logger.debug("==============CONNECTION==============");
    for (let roomIndex = 0; roomIndex < this.rooms.length; roomIndex++)
    {
      this.logger.debug("\n" + "\tIndex: " + roomIndex + "\n" +
                        "\tP1 Id : " + this.rooms[roomIndex].playerOne + "\n" +
                        "\tP2 Id : " + this.rooms[roomIndex].playerTwo + "\n");
    }
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
        if (this.rooms[roomIndex].playerOne == client.id)
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
        if (this.rooms[roomIndex].playerTwo == client.id)
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
        if (currentState.gameStart == true && client.id == this.rooms[roomIndex].playerOne)
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
        this.server.to(this.rooms[roomIndex].name).emit('ClientMSG', this.rooms[roomIndex].gameStates[0]);
        }
    }    
  }
}
