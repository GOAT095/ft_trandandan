import { Dialog } from '@angular/cdk/dialog';
import { Component, Input, OnInit } from '@angular/core';
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


  constructor(public api: ApiService, public ws: WsService, public dialog: Dialog) {}

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
      }
    )
  }
  inviteFor1vs1() {
    this.ws.notify('1vs1', {'message': `${this.me.name} has invited you to a game.`}, this.player)
  }

  showProfile() {
    // TODO: Open player profile
    //console.log('open player profile');
    this.dialog.open(PlayerInfoShortComponent);
  }

  openProfile() {
    this.dialog.open(PlayerInfoComponent);
  }

  showPlayerMatchHistory() {
    this.dialog.open(PlayerMatchHistoryComponent);
  }

  addAsAdmin() {

  }

  kickPlayer() {

  }

  banPlayer() {

  }

  mutePlayer() {

  }

  isChat(): boolean {
    return this.type == 'chat';
  }

  ngOnInit(): void {
  }

}
