import { Component, OnInit } from '@angular/core';
import SwiperCore from 'swiper';

@Component({
  selector: 'app-game-spectate',
  templateUrl: './game-spectate.component.html',
  styleUrls: ['./game-spectate.component.less']
})
export class GameSpectateComponent implements OnInit {

  type : string = 'flex';

  _online_games: any[] = [
    {
      'ns': '',
      'players': [
        {
          id: '-1',
          name: 'Player 2',
          wins: 0, lvl: 0, losses: 0,
          status: 'online',
          avatar: '',
          email: '',
          twoFactor: false
        },
        {
          id: '-1',
          name: 'Player 3',
          wins: 0, lvl: 0, losses: 0,
          status: 'online',
          avatar: '',
          email: '',
          twoFactor: false
        }
      ]
    }
  ];

  online_games: any[] = [];
  constructor() {
    for (let i = 0; i < 20; i++) {
      this.online_games.push(this._online_games[0]);
    }
  }

  ngOnInit(): void {
  }

}
