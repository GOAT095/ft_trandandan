import { Component, OnInit } from '@angular/core';
import { elementAt } from 'rxjs';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-player-friends',
  templateUrl: './player-friends.component.html',
  styleUrls: ['./player-friends.component.less']
})
export class PlayerFriendsComponent implements OnInit {

  me: Player = {
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


  friends: Player[] = [];
  players: Player[] = [];
  searchResults: Player[] = [];
  query: string = "";
  constructor(public api: ApiService) {
    api.getPlayer().subscribe(
      (player) => {
        this.me = player;
      }
    )
    api.getPlayerFriends().subscribe(
      (acceptedFriendRequests) => {
        acceptedFriendRequests.forEach(element => {
          if (element.requestReceiver.id == this.me.id) {
            this.friends.push(element.requestSender)
          }
          else {
            this.friends.push(element.requestReceiver)
          }
        });
      }
    )
    api.getPlayers().subscribe(
      (players) => {
        this.players = players;
      }
    )
  }

  ngOnInit(): void {
  }
  onKey(value: string) {
    console.log(value);
    let tempSearchResults: Player[] = [];
    this.players.forEach((element) => {
      if (element.name.match(value) != null) {
        tempSearchResults.push(element)
      }
    })
    this.searchResults = tempSearchResults;
  }
}