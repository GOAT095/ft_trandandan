import { Dialog } from '@angular/cdk/dialog';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { GameHelpDialogComponent } from '../game-help-dialog/game-help-dialog.component';
import { MainNewDialogComponent } from '../main-new-dialog/main-new-dialog.component';
import { MainOfflineDialogComponent } from '../main-offline-dialog/main-offline-dialog.component';
import { PlayerFriendRequestsComponent } from '../player-friend-requests/player-friend-requests.component';
import { PlayerFriendsComponent } from '../player-friends/player-friends.component';
import { PlayerSettingsComponent } from '../player-settings/player-settings.component';
import { CdkOverlayOrigin, ConnectionPositionPair, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { WsService } from '../ws.service';
import { RoomSearchComponent } from '../room-search/room-search.component';
import { NewRoomComponent } from '../new-room/new-room.component';
import { RoomListComponent } from '../room-list/room-list.component';
import { FriendsListComponent } from '../friends-list/friends-list.component';
import { environment } from 'src/environments/environment';
import { GameSpectateComponent } from '../game-spectate/game-spectate.component';
import { GameInviteComponent } from '../game-invite/game-invite.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {

  player : Player = {
    id: '-1',
    name: '---',
    wins: 0, lvl: 0, losses: 0,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  blockList: string[] = [];

  gameView = 0;
  friendsRequestsCount = 2;
  isChatOpen = false;
  isNotificationBarOpen = false;

  chatMessages = [
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fugit unde ut deserunt, tenetur illo laboriosam, nemo, nihil molestias iste atque accusamus inventore dolore debitis porro deleniti cumque. Perferendis, dolor! Ipsum.",
    "Common sense is not so common"
  ];
  notifications = [
    {"message": "foobar sent a friend request"},
    {"message": "foobar invites you for a 1vs1"},
  ]

  // input
  chatMessage : string = '';

  // overlay
  positions = [
    new ConnectionPositionPair(
      { originX: 'start', originY: 'top'},
      { overlayX: 'start', overlayY: 'bottom'}
    ),
  ];

  @ViewChild('messages_box') messages_box!: ElementRef<HTMLDivElement>;
  mode :number = 1;

  constructor(
    private api: ApiService, private route: ActivatedRoute, public dialog: Dialog, public ws: WsService,
    ) {
    api.getPlayer().subscribe(
      (data) => {
        this.player = data;
        // open first login dialog
        this.route.queryParamMap.subscribe(
          (params) => {
            var param = params.get('new')
            if (param != null && param == 'true') {
              this.openFirstLoginDialog();
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
        // get player friends requests
        api.getFriendRequests().subscribe(
          (data) => {
            this.friendsRequestsCount = data.length;
          }
          )

        // initialize WsService
        ws.initialize(this.player);
        ws.handleNotify();
        ws.handleChatMessage();
        ws.handleRoomChatMessage();
        ws.handleDirectMessage();
        ws.handleListRooms();
        // listen to ws.events
        ws.newMessageEvent.subscribe((data) => {
          if (this.messages_box != null) {
            this.messages_box.nativeElement.scrollTop = this.messages_box.nativeElement.scrollHeight;
            setTimeout(() => {
              if (this.messages_box != null) {
                this.messages_box.nativeElement.scrollTop = this.messages_box.nativeElement.scrollHeight;
              }
            }, environment.chatRefreshTime)
          }
        })
        ws.newGameInviteEvent.subscribe((data) => {
          this.dialog.open(GameInviteComponent, {
            data: data,
          });
        })
        // ask the game server to send us the current list of online games
        ws.fetchRooms();
        // listen to http updates
        api.blockEvent.subscribe(
          (data) => {
            console.debug('main.component:blockEvent', data);
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
            console.debug('main.component:unBlockEvent', data);
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
      },
      (error) => {
        this.openOfflineDialog(error.statusText);
      }
    )
    // init messages
    //for (let i = 0; i < 10; i++) {
    //}
   console.debug('Initialized MainComponent', this.player);
  }

  openOfflineDialog(errorStr: string): void {
    const dialogRef = this.dialog.open<string>(MainOfflineDialogComponent, {
      data: {errorStr: errorStr},
      disableClose: true,
    });
    dialogRef.closed.subscribe(result=> {
      console.debug('MainOfflineDialogComponent closed');
    })
  }

  openFirstLoginDialog(): void {
    const dialogRef = this.dialog.open<string>(MainNewDialogComponent, {
      data: {player: this.player}
    });
    dialogRef.closed.subscribe(result => {
      console.debug('MainNewDialogComponent closed')
    })
  }

  updatePlayer(player: Player) {
    this.player = player;
  }

  logout(): void {
    // Unset cookie
    this.api.http.get(`${this.api.apiUrl}/auth/logout/${this.player.id}`, {withCredentials: true}).subscribe(
      () => {
        window.open("/", "_self");
      }
    );
  }

  // game
  toggleView(): void {
    this.gameView = (this.gameView + 1) % 2;
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: "c",
      keyCode: 0x43,
      code: "KeyC",
      which: 0x43,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    }));
    console.debug('MainComponent.toggleView()')
  }

  // start
  gameStart(): void {
    const SPACE_BAR = 32;
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: "c",
      keyCode: SPACE_BAR,
      code: "KeyC",
      which: SPACE_BAR,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    }));
  }

  keyPress(event: KeyboardEvent): void {
    if (event.key == 'c')
    {
        this.gameView = (this.gameView + 1) % 2;
        console.log(this.gameView);
    }
  }

  // shortcut Dialog
  openShortcutDialog(): void {
    const dialogRef = this.dialog.open<string>(GameHelpDialogComponent);
  }

  // settings dialog
  openSettingsDialog(): void {
    const dialogRef = this.dialog.open<string>(PlayerSettingsComponent, {
      data: {
        player: this.player,
        privacy: true
      }
    });
  }

  openFriendsListDialog(): void {
    const dialogRef = this.dialog.open<string>(FriendsListComponent, {
      data: {player: this.player}
    });
  }
  openFriendsSearchDialog(): void {
    const dialogRef = this.dialog.open<string>(PlayerFriendsComponent);
  }
  openFriendsRequestsDialog(): void {
    const dialogRef = this.dialog.open<string>(PlayerFriendRequestsComponent)
  }

  openRoomsSearchDialog(): void {
    const dialogRef = this.dialog.open<string>(RoomSearchComponent, {
      data: {player: this.player}
    });
  }

  openNewRoomDialog(): void {
    const dialogRef = this.dialog.open<string>(NewRoomComponent, {
      data: {player: this.player}
    });
  }

  openRoomListDialog(): void {
    const dialogRef = this.dialog.open<string>(RoomListComponent, {
      data: {player: this.player}
    });
  }

  openSpectateDialog(): void {
    // list available games
    let dialogRef = this.dialog.open(GameSpectateComponent);
    if (dialogRef.componentInstance != null) {
      dialogRef.componentInstance.type = 'swiper';
    }
  }

  showSpectateDialog(): void {
    // pick the latest online game
    let dialogRef = this.dialog.open(GameSpectateComponent);
    if (dialogRef.componentInstance != null) {
      dialogRef.componentInstance.type = 'flex';
    }
  }


  sendChatMessage(): void {
    this.ws.postToChat('global', this.chatMessage, this.player);
    // TODO:
    // - clean current message
    this.chatMessage = '';
    /*
    this.messages_box.nativeElement.scrollTop = this.messages_box.nativeElement.scrollHeight;
    setTimeout(() => {
      this.messages_box.nativeElement.scrollTop = this.messages_box.nativeElement.scrollHeight;
    }, 1500)
    */
  }

  ngOnInit(): void {
    //window.addEventListener('keydown', this.keyPress, false);
  }
}
