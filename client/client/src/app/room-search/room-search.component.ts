import { Component, Inject, Input, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import {Dialog, DialogRef, DIALOG_DATA} from '@angular/cdk/dialog';
import { WsService } from '../ws.service';

@Component({
  selector: 'app-room-password-prompt',
  templateUrl: './room-password-prompt.component.html',
  styleUrls: ['./room-password-prompt.component.less']
})
export class RoomPasswordPromptComponent implements OnInit {

  @Input()
  player: Player = {
    //id: '-1',
    id: '53993',
    name: 'Rui Uemara',
    wins: 10,
    losses: 9,
    lvl: 9,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  room: any;
  password: string = '';

  constructor(public dialogRef: DialogRef<any>, @Inject(DIALOG_DATA) public dialog_data: any) {
    this.player = dialog_data.player;
    this.room = dialog_data.room;
  }
  ngOnInit(): void {}
  join() {
    this.dialogRef.close(
      {
        'ok': true,
        'password': this.password
      }
    )
  }
  cancel() {
    this.dialogRef.close(
      {
        'ok': false,
        'password': ''
      }
    )
  }
}

@Component({
  selector: 'app-room-search',
  templateUrl: './room-search.component.html',
  styleUrls: ['./room-search.component.less']
})
export class RoomSearchComponent implements OnInit {

  @Input()
  player: Player = {
    //id: '-1',
    id: '53993',
    name: 'Rui Uemara',
    wins: 10,
    losses: 9,
    lvl: 9,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };


  rooms : any[] = [];
  constructor(public api: ApiService, public dialog: Dialog,
    public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public dialog_data: any,
    public ws: WsService) {
    this.player = dialog_data.player;
    this.api.getPublicAndProtectedRooms().subscribe(
      (data) => {
        console.log(data)
        this.rooms = data;
      }
    )
  }

  joinRoom(roomId: number) {
    if (this.rooms[roomId].type == 'protected') {
      // prompt for password
      this.dialog.open<any>(RoomPasswordPromptComponent, {
        data: {
          player: this.player,
          room: this.rooms[roomId] 
        }
      }).closed.subscribe((result) => {
        if (result.ok) {
          //console.log('password', result.password)
          this.api.joinProtectedRoom(String(this.rooms[roomId].id), this.player.id, result.password).subscribe(
            (data) => {console.log(data);}
          )
        }
      })
    }
    else {
      this.api.joinRoom(String(this.rooms[roomId].id), this.player.id).subscribe(
        (data) => {console.log(data);}
      )
    }
  }

  ngOnInit(): void {
  }

}
