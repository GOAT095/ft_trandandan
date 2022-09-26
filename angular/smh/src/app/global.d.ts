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