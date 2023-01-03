import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-player-match-history',
  templateUrl: './player-match-history.component.html',
  styleUrls: ['./player-match-history.component.less']
})
export class PlayerMatchHistoryComponent implements OnInit {

  
  /*
  history = [
    {'vs': {}, // player
     'win': true, // true/false
     'score': [0, 0] // first-player/second-player
    },
  ]
  */

  _history = [
    {
      'vs': {
        id: '-1',
        name: 'Player 2',
        wins: 0, lvl: 0, losses: 0,
        status: 'online',
        avatar: '',
        email: '',
        twoFactor: false
      },
      'win': true,
      'score': [5, 3]
    },
    {
      'vs': {
        id: '-1',
        name: 'Player 3',
        wins: 0, lvl: 0, losses: 0,
        status: 'online',
        avatar: '',
        email: '',
        twoFactor: false
      },
      'win': false,
      'score': [3, 7]
    }

  ]

  history : any[] = [];

  player : Player = {
    id: '-1',
    name: 'Player 0',
    wins: 0, lvl: 0, losses: 0,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  constructor() {
    for (let i = 0; i < 20; i++) {
      this.history.push(this._history[0]);
      this.history.push(this._history[1]);
    }
  }

  ngOnInit(): void {
  }

}
