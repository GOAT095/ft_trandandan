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
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}