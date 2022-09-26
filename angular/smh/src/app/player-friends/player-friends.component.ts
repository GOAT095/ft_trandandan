import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-player-friends',
  templateUrl: './player-friends.component.html',
  styleUrls: ['./player-friends.component.less']
})
export class PlayerFriendsComponent implements OnInit {

  friends: Player[] = [];
  constructor(public api: ApiService) {
    api.getPlayerFriends().subscribe(
      (acceptedFriendRequests) => {
        acceptedFriendRequests.forEach(element => {
          this.friends.push(element.requestSender)
        });
      }
    )
  }

  ngOnInit(): void {
  }

}
