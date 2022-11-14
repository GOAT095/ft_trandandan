import { Component, OnInit, Input, Inject } from '@angular/core';
import { ApiService } from '../api.service';
import {Dialog, DialogRef, DIALOG_DATA} from '@angular/cdk/dialog';

@Component({
  selector: 'app-new-room',
  templateUrl: './new-room.component.html',
  styleUrls: ['./new-room.component.less']
})
export class NewRoomComponent implements OnInit {

  @Input()
  player: Player = {
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

  name: string = '';
  type: string = 'Public';
  password: string = '';

  constructor(public api: ApiService, public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public data: any) {
    this.player = data.player;
  }
  
  ngOnInit(): void {
  }

  newRoom(): void {
    switch (this.type) {
      case 'protected': {
        this.api.createRoom({
          'name': this.name,
          'type': this.type,
          'owner': this.player.id,
          'password': this.password
        }).subscribe(
          (resp) => {console.log(resp);}
        );
        break;
      }
      default: {
        this.api.createRoom({
          'name': this.name,
          'type': this.type,
          'owner': this.player.id,
        }).subscribe(
          (resp) => {console.log(resp);}
        );
      }
    }

  }

}
