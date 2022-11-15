import { Component, OnInit, Input, Inject, ViewChild, ElementRef} from '@angular/core';
import { ApiService } from '../api.service';
import {Dialog, DialogRef, DIALOG_DATA} from '@angular/cdk/dialog';
import { CdkListbox } from '@angular/cdk/listbox';
import { WsService } from '../ws.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.less']
})
export class RoomListComponent implements OnInit {

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

  rooms: any[] = [];

  public selectedRoomId: readonly number[] = [-1,];
  selected: boolean = false;

  blockList: string[] = [];

  chatMessage: string = '';

  @ViewChild(CdkListbox) roomListbox!: CdkListbox;

  constructor(public api: ApiService,
    public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public dialog_data: any,
    public ws: WsService) {
  //constructor(public api: ApiService, private ref: ElementRef, public ws: WsService) {
    this.player = dialog_data.player;
    this.api.getPlayerActiveRooms(this.player.id).subscribe(
      (data) => {
        console.log(data);
        this.rooms = data;
        if (data.length > 0) {
          //this.selectedRoomId = [data[0].id];
          //this.selected = true;
          this.roomListbox.select(data[0].id);
          //console.log(this.roomListbox);
          //console.log(this.ref.nativeElement.getElementById())
        }
      }
    )
    // get player blockList
    api.getPlayerBlockList().subscribe(
        (blockList) => {
          blockList.forEach(element => {
            console.log(element.blocked);
            this.blockList.push(element.blocked.id);
            //console.log('blockList', this.blockList);
          })
        }
      )
  }

  onSelect() {
    console.log('select');
  }

  sendChatMessage(): void {
    this.ws.postToRoom(this.rooms[this.selectedRoomId[0]], this.chatMessage, this.player);
    // TODO:
    // - clean current message
    this.chatMessage = '';
  }


  ngOnInit(): void {
  }

}
