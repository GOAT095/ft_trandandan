interface Player {
  id: string,
  name: string,
  wins: number,
  losses: number,
  lvl: number,
  status: string,
  avatar: string,
  email: string,
  twoFactor: boolean
}

interface FriendRequest {
  id: string,
  FriendStatus: string,
  requestReceiver: Player,
  requestSender: Player
}

interface BlockObject {
  id: string,
  blocker: Player,
  blocked: Player
}

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  notification: (data: any, callback: (data: any) => void) => void;
  chatMessage: (data: any, callback: (data: any) => void) => void;
  roomChatMessage: (data: any, callback: (data: any) => void) => void;
  directMessage: (data: any, callback: (data: any) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
  notification: (data: any) => void;
  chatMessage: (data: any) => void;
  roomChatMessage: (data: any) => void;
  directMessage: (data: any) => void;
}

interface InterServerEvents {
  ping: () => void;
  notification: (data: any) => void;
}

interface SocketData {
  name: string;
  age: number;
}

declare var mode:number;