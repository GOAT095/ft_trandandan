import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { DialogData } from '../action-button/action-button.component';
import { ApiService } from '../api.service';

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

  games_history: any[] = [];

  constructor(public api: ApiService, @Inject(DIALOG_DATA) public dialog_data: any) {
    this.player = dialog_data.player;
    //for (let i = 0; i < 20; i++) {
    //  this.history.push(this._history[0]);
    //  this.history.push(this._history[1]);
    //}
    this.api.getPlayerGameHistory(this.player.id).subscribe(
      (data) => {
        this.games_history = data;
        console.debug('player-match-history:games_history', data);
      }
    )
  }

  ngOnInit(): void {
  }

}
