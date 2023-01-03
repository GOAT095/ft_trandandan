import { Component, OnInit, Input, Inject } from '@angular/core';
import {Dialog, DialogRef, DIALOG_DATA} from '@angular/cdk/dialog';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-room-settings',
  templateUrl: './room-settings.component.html',
  styleUrls: ['./room-settings.component.less']
})
export class RoomSettingsComponent implements OnInit {

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

  @Input()
  room: any;

  constructor(public api: ApiService, public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public dialog_data: any) {
    this.player = dialog_data.player;
    this.room = dialog_data.room;
    this.room.password = '';
  }

  update() {
    let room = this.room;
    if (room.password) {
      this.api.updateRoomPassword(room.id, room.name, room.type, room.password).subscribe(
        (data) => {
          this.dialogRef.close('ok');
        }
      )
    }
    else {
      this.api.updateRoom(room.id, room.name, room.type).subscribe(
        (data) => {
          this.dialogRef.close('ok');
        }
      )
    }
  }

  ngOnInit(): void {
  }

}
