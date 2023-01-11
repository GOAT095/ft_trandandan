import { Component, OnInit, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ApiService } from '../api.service';
import { WsService } from '../ws.service';

@Component({
  selector: 'app-game-invite',
  templateUrl: './game-invite.component.html',
  styleUrls: ['./game-invite.component.less']
})
export class GameInviteComponent implements OnInit {


  fromPlayer: Player = {
    id: '-1',
    name: 'Rui Uemara',
    wins: 10,
    losses: 9,
    lvl: 9,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  roomId: string = '';

  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA) public data: any,
    public api: ApiService,
    public ws: WsService
    ) {
      console.debug('game-invite:', data.data);
      this.fromPlayer = data.data.fromPlayer;
      this.roomId = data.data.roomId;
    }

  ngOnInit(): void {
  }

  accept(): void {
    window.open(`/default?pvp=${this.roomId}`, '_self')?.focus();
    this.dialogRef.close();
  }

  decline(): void {
    // send event: roomId, user.id
    this.ws.sendPvpDeclineRequest(this.roomId, Number(this.fromPlayer.id))
    this.dialogRef.close();
  }
}
