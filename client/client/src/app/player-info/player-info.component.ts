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
  lvl: number = 0;

  achievements = {
    newbie: false,
    firstBlood: false,
    amateur: false,
    bringEmOn: false,
    master: false,
    IamDeath: false
  }

  constructor() {
    this.loadAchievements();
    console.log('player-info:achievements',this.achievements);
  }

  loadAchievements(): void {
    this.lvl = Math.round(this.player.lvl / 12);
    this.achievements.newbie = this.player.wins > 0 || this.player.losses > 0;
    this.achievements.firstBlood = this.player.wins > 0;
    this.achievements.amateur = this.player.wins >= 3;
    this.achievements.master = this.player.wins >= 6;
    //this.achievements.bringEmOn = this.player.maxStreaks >= 3
    //this.achievements.IamDeath = this.player.maxStreaks >= 6
  }

  /*
  achievements:
    - newbie: play at least one game, win > 0 or loss > 0
    - firstBlood: win at least one game, win > 0
    - <amateur> win 3 games, win >= 3
    - <Bring 'em on!>: have a max streak of 3 wins, max_streak >= 3
    - <master> win 6 games, win >= 6
    - <I am Death incarnate!> have a max streak of 6 wins, max_streak >= 6
  */

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
