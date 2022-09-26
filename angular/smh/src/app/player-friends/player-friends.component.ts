import { Component, OnInit } from '@angular/core';
import { elementAt } from 'rxjs';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-player-friends',
  templateUrl: './player-friends.component.html',
  styleUrls: ['./player-friends.component.less']
})
export class PlayerFriendsComponent implements OnInit {

  friends: Player[] = [];
  players: Player[] = [];
  searchResults: Player[] = [];
  query: string = "";
  constructor(public api: ApiService) {
    api.getPlayerFriends().subscribe(
      (acceptedFriendRequests) => {
        acceptedFriendRequests.forEach(element => {
          this.friends.push(element.requestSender)
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