import { Component, OnInit, Input, Inject, ViewChild, ElementRef} from '@angular/core';
import { ApiService } from '../api.service';
import {Dialog, DialogRef, DIALOG_DATA} from '@angular/cdk/dialog';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { WsService } from '../ws.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.less']
})
export class FriendsListComponent implements OnInit {

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

  friends: Player[] = [];
  blockList: string[] = [];

  public selectedPlayerId: readonly number[] = [];
  selected: boolean = false;

  chatMessage: string = '';

  @ViewChild(CdkListbox) playerListbox!: CdkListbox;
  @ViewChild('chat_messages_view') chat_messages_view!: ElementRef<HTMLDivElement>;

  constructor(public api: ApiService,
    public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public dialog_data: any,
    public ws: WsService) {
    this.player = dialog_data.player;
    api.getPlayerFriends().subscribe(
      (acceptedFriendRequests) => {
        acceptedFriendRequests.forEach(element => {
          if (element.requestReceiver.id == this.player.id) {
            this.friends.push(element.requestSender)
          }
          else {
            this.friends.push(element.requestReceiver)
          }
        });
        if (this.friends.length > 0) {
          //this.playerListbox.select(new CdkOption<unknown>());
        }
        // listen to ws.events
        ws.newDirectMessageEvent.subscribe((data) => {
          this.chat_messages_view.nativeElement.scrollTop = this.chat_messages_view.nativeElement.scrollHeight;
          setTimeout(() => {
            this.chat_messages_view.nativeElement.scrollTop = this.chat_messages_view.nativeElement.scrollHeight;
          }, environment.chatRefreshTime)
        })
      }
    )
    api.getPlayerBlockList().subscribe(
      (blockList) => {
        blockList.forEach(element => {
          console.log(element.blocked);
          this.blockList.push(element.blocked.id);
          //console.log('blockList', this.blockList);
        })
      }
    )
    // listen to http updates
    api.blockEvent.subscribe(
      (data) => {
        console.debug('friends-list.component:blockEvent', data);
        api.getPlayerBlockList().subscribe(
            (blockList) => {
              this.blockList = [];
              blockList.forEach(element => {
                //console.log(element.blocked);
                this.blockList.push(element.blocked.id);
                //console.log('blockList', this.blockList);
              })
            }
          )
      }
    )
    api.unBlockEvent.subscribe(
      (data) => {
        console.debug('friends-list.component:unBlockEvent', data);
        api.getPlayerBlockList().subscribe(
            (blockList) => {
              this.blockList = [];
              blockList.forEach(element => {
                //console.log(element.blocked);
                this.blockList.push(element.blocked.id);
                //console.log('blockList', this.blockList);
              })
            }
          )
      }
    )
  }

  onSelect() {
    console.log('select');
  }

  sendChatMessage(): void {
    console.log('friends', this.friends, 'selected', this.selectedPlayerId);
    this.ws.sendDirectMessage(this.friends[this.selectedPlayerId[0]], this.chatMessage, this.player);
    // TODO:
    // - clean current message
    // Add our message to the messages list
    if (!(this.friends[this.selectedPlayerId[0]].id in this.ws.directMessages)) {
      this.ws.directMessages[this.friends[this.selectedPlayerId[0]].id] = []
    }
    this.ws.directMessages[this.friends[this.selectedPlayerId[0]].id].push({
      'message': this.chatMessage,
      'player': this.player
    })
    this.chatMessage = '';
  }


  ngOnInit(): void {
  }

}