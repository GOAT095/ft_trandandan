import { Dialog, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Md5 } from 'ts-md5';

import { ApiService } from '../api.service';
import { PlayerInfoComponent } from '../player-info/player-info.component';
import { PlayerMatchHistoryComponent } from '../player-match-history/player-match-history.component';
import { WsService } from '../ws.service';

@Component({
  selector: 'app-player-info-short',
  templateUrl: './player-info-short.component.html',
  styleUrls: ['./player-info-short.component.less']
})
export class PlayerInfoShortComponent implements OnInit {

  @Input() player: Player = {
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

  gravatarUrl = 'https://www.gravatar.com/avatar'
  apiUrl = environment.apiUrl;
  avatarSrc : string = this.getAvatarSrc();

  @Input() type: string = "normal";

  @Input() me: Player = {
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

  @Input() isAlreadyBlocked: boolean = false;

  @Input() roomId: number = -1;

  constructor(public api: ApiService, public ws: WsService, public dialog: Dialog) {
    //if (data != null && data.type != null) {
    //  this.type = data.type;
    //}
    //this.api.blockEvent.subscribe(
    //  (data) => {console.debug('player-info-short:blockEvent',data)}
    //)
  }

  getGravatarSrc(): string {
    let md5 = new Md5();
    let hash = md5.appendStr(`${this.player.name}@student.1337.ma`).end()
    if (this.player.email) {
      hash = md5.appendStr(this.player.email).end();
    }
    return `${this.gravatarUrl}/${hash}?d=retro`
  }

  getAvatarSrc(): string {
    if (this.player.avatar == null) {
      let md5 = new Md5();
      let hash = md5.appendStr(`${this.player.name}@student.1337.ma`).end()
      if (this.player.email) {
        hash = md5.appendStr(this.player.email).end();
      }
      return `${this.gravatarUrl}/${hash}?d=retro`
    }
    return `${this.apiUrl}/${this.player.avatar}`;
  }

  onAvatarSrcError(event: Event) {
    (event.target as HTMLImageElement).src = this.getGravatarSrc();
  }

  sendFriendRequest() {
    this.api.sendFriendRequest(this.player.id).subscribe(
      (data) => {
        // TODO: give visual feedback back to user.
      }
    )
  }
  block() {
    this.api.blockPlayer(this.player.id).subscribe(
      (data) => {
        // TODO: give visual feedback back to user
        console.debug('PlayerInfoShortComponent.blockPlayer', data);
        this.api.blockEvent.next(data);
      }
    )
  }

  unblock() {
    this.api.unblockPlayer(this.player.id).subscribe(
      (data) => {
        // TODO: give visual feedback back to user
        console.debug('PlayerInfoShortComponent.unblockPlayer', data);
        this.api.unBlockEvent.next(data);
      }
    )
  }

  inviteFor1vs1() {
    let roomId = this.ws.requestGame(Number(this.me.id));
    this.ws.notify('1vs1', {'message': `${this.me.name} has invited you to a game.`, 'fromPlayer': this.me, 'roomId': roomId}, this.player)
    setTimeout(() => {
      window.open(`/default?pvp=${roomId}`, '_self')?.focus();
    }, 1000)
  }

  showProfile() {
    // TODO: Open player profile
    //console.log('open player profile');
    let dialogRef = this.dialog.open(PlayerInfoShortComponent, {
      data: {me: this.me, player: this.player}
    });
    if (dialogRef.componentInstance != null) {
      //dialogRef.componentInstance.type = 'chat';
      dialogRef.componentInstance.player = this.player;
      dialogRef.componentInstance.me = this.me;
      dialogRef.componentInstance.isAlreadyBlocked = this.isAlreadyBlocked;
    }
  }

  openProfile() {
    let dialogRef = this.dialog.open(PlayerInfoComponent, {
      data: {me: this.me, player: this.player}
    });
    if (dialogRef.componentInstance != null) {
      dialogRef.componentInstance.player = this.player;
      dialogRef.componentInstance.loadAchievements();
    }
  }

  showPlayerMatchHistory() {
    let dialogRef = this.dialog.open(PlayerMatchHistoryComponent, {
      data: {player: this.player}
    });
    if (dialogRef.componentInstance != null) {
      dialogRef.componentInstance.player = this.player;
      console.log('showPlayerMatchHistory:', this.player);
    }
  }

  addAsAdmin() {
    console.debug('addAsAdmin:', this.roomId, this.player.id);
    this.api.setPlayerAsAdmin(String(this.roomId), this.player.id).subscribe(
      (data) => {
        console.log('setAsAdmin:data', data);
      }
    )
  }

  kickPlayer() {
    console.debug('kickPlayer', this.roomId);
    this.api.kickPlayerFromRoom(String(this.roomId), this.player.id).subscribe(
      (data) => {
        console.log('kickPlayer:data', data);
      }
    )
  }

  banPlayer() {
    console.debug('banPlayer', this.roomId);
    this.api.banPlayerFromRoom(String(this.roomId), this.player.id).subscribe(
      (data) => {
        console.log('banPlayer:data', data);
        this.kickPlayer();
      }
    )
  }

  mutePlayer() {
    console.debug('mutePlayer', this.roomId)
    this.api.mutePlayerFromRoom(String(this.roomId), this.player.id).subscribe(
      (data) => {
        console.log('mutePlayer:data', data);
      }
    )
  }

  isChat(): boolean {
    return this.type == 'chat';
  }

  ngOnInit(): void {
  }

}
