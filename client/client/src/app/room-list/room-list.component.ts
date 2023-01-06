import { Component, OnInit, Input, Inject, ViewChild, ElementRef} from '@angular/core';
import { ApiService } from '../api.service';
import {Dialog, DialogRef, DIALOG_DATA} from '@angular/cdk/dialog';
import { CdkListbox, ListboxValueChangeEvent } from '@angular/cdk/listbox';
import { WsService } from '../ws.service';
import { RoomSettingsComponent } from '../room-settings/room-settings.component';
import { environment } from 'src/environments/environment';

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
  @ViewChild('chat_messages_view') chat_messages_view!: ElementRef<HTMLDivElement>

  constructor(public api: ApiService, public dialog: Dialog,
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
        // listen to ws.events
        ws.newRoomMessageEvent.subscribe((data) => {
          this.chat_messages_view.nativeElement.scrollTop = this.chat_messages_view.nativeElement.scrollHeight;
          setTimeout(() => {
            this.chat_messages_view.nativeElement.scrollTop = this.chat_messages_view.nativeElement.scrollHeight;
          }, environment.chatRefreshTime)
        })
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

  select(event: ListboxValueChangeEvent<number>) {
    console.log(event);
  }

  sendChatMessage(): void {
    if (this.selectedRoomId.length == 0) {
      return;
    }
    console.log('selectedRoomId', this.selectedRoomId[0]);
    console.log('selectedRoom', this.rooms[this.selectedRoomId[0]]);
    this.ws.postToRoom(this.rooms[this.selectedRoomId[0]], this.chatMessage, this.player);
    // TODO:
    // - clean current message
    this.chatMessage = '';
  }

  openRoomSettingsDialog() {
    this.dialog.open<string>(RoomSettingsComponent, {
      data: {player: this.player, room: this.rooms[this.selectedRoomId[0]]}
    });
  }

  leaveRoom(roomId: string) {
    this.api.leaveRoom(roomId).subscribe(
      (data) => {
        console.log(data);
        // refresh rooms list
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
      }
    )
  }
  ngOnInit(): void {
  }

}
