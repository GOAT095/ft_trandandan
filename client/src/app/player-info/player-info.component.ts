import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.component.html',
  styleUrls: ['./player-info.component.less']
})
export class PlayerInfoComponent implements OnInit {

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

  constructor() {}

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

  ngOnInit(): void {}

}
