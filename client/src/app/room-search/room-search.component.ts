import { Component, Inject, Input, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import {Dialog, DialogRef, DIALOG_DATA} from '@angular/cdk/dialog';
import { WsService } from '../ws.service';

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
  constructor(public api: ApiService,
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
    this.api.joinRoom(String(this.rooms[roomId].id), this.player.id).subscribe(
      (data) => {console.log(data);}
    )
  }

  ngOnInit(): void {
  }

}
