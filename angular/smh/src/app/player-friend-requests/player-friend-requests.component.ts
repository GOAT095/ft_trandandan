import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-player-friend-requests',
  templateUrl: './player-friend-requests.component.html',
  styleUrls: ['./player-friend-requests.component.less']
})
export class PlayerFriendRequestsComponent implements OnInit {

  friendRequests: FriendRequest[] = [];
  constructor(public api: ApiService) {
    api.getFriendRequests().subscribe(
      (data) => {
        this.friendRequests = data;
      }
    )
  }

  declineRequest(index: number) {
    console.log("declined", index, this.friendRequests[index])
    this.api.declineFriendRequest(this.friendRequests[index].id).subscribe(
      (result) => {
        if (result == true) {
          this.friendRequests.splice(index, 1);
        }
      }
    )
  }
  acceptRequest(index: number) {
    console.log("accepted", index, this.friendRequests[index])
    this.api.acceptFriendRequest(this.friendRequests[index].id).subscribe(
      (result) => {
        if (result == true) {
          this.friendRequests.splice(index, 1);
        }
      }
    )
  }
  ngOnInit(): void {
  }

}
