import { Component, Input, OnInit } from '@angular/core';
import { Md5 } from 'ts-md5';

import { ApiService } from '../api.service';

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
  apiUrl = 'http://localhost:3000'
  avatarSrc : string = this.getAvatarSrc();

  constructor(public api: ApiService) {}

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
  ngOnInit(): void {
  }

}
