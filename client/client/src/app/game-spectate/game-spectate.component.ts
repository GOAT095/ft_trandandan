import { Component, OnInit } from '@angular/core';
import SwiperCore from 'swiper';
import { ApiService } from '../api.service';
import { WsService } from '../ws.service';

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
  constructor(public ws: WsService, public api: ApiService) {
    //for (let i = 0; i < 20; i++) {
    //  this.online_games.push(this._online_games[0]);
    //}
    this.online_games = [];
    this.api.getPlayers().subscribe(
      (players) => {
        // fetch players info (convert Id's to player objects)
        ws.activeGames.forEach(
          (elem) => {
            if (elem.player1ID != 0 && elem.player2ID != 0) {
              let player1: Player = {
                id: '-1',
                name: 'Player 1',
                wins: 0, lvl: 0, losses: 0,
                status: 'online',
                avatar: '',
                email: '',
                twoFactor: false
              };
              let player2: Player = {
                id: '-1',
                name: 'Player 1',
                wins: 0, lvl: 0, losses: 0,
                status: 'online',
                avatar: '',
                email: '',
                twoFactor: false
              };
              for (let i = 0; i < players.length; i++) {
                if (players[i].id == elem.player1ID) {
                  player1 = players[i];
                }
                if (players[i].id == elem.player2ID) {
                  player2 = players[i];
                }
              }
              this.online_games.push({
                'roomId': elem.id,
                'player1': player1,
                'player2': player2
              })
            }
         }
        )
        console.debug('game-spectate.component', this.online_games)
      }
    )
    ws.activeGamesUpdate.subscribe(
      (active_games) => {
        console.log('game-spectate.component', active_games);
        //this.online_games = active_games;
        this.online_games = [];
        this.api.getPlayers().subscribe(
          (players) => {
            // fetch players info (convert Id's to player objects)
            active_games.forEach(
              (elem) => {
                if (elem.player1ID != 0 && elem.player2ID != 0) {
                  let player1: Player = {
                    id: '-1',
                    name: 'Player 1',
                    wins: 0, lvl: 0, losses: 0,
                    status: 'online',
                    avatar: '',
                    email: '',
                    twoFactor: false
                  };
                  let player2: Player = {
                    id: '-1',
                    name: 'Player 1',
                    wins: 0, lvl: 0, losses: 0,
                    status: 'online',
                    avatar: '',
                    email: '',
                    twoFactor: false
                  };
                  for (let i = 0; i < players.length; i++) {
                    if (players[i].id == elem.player1ID) {
                      player1 = players[i];
                    }
                    if (players[i].id == elem.player2ID) {
                      player2 = players[i];
                    }
                  }
                  this.online_games.push({
                    'roomId': elem.id,
                    'player1': player1,
                    'player2': player2
                  })
                }
             }
            )
            console.debug('game-spectate.component', this.online_games)
          }
        )
      }
    )
  }

  ngOnInit(): void {
  }

}
