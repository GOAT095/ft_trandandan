import { Dialog } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { GameHelpDialogComponent } from '../game-help-dialog/game-help-dialog.component';
import { MainNewDialogComponent } from '../main-new-dialog/main-new-dialog.component';
import { MainOfflineDialogComponent } from '../main-offline-dialog/main-offline-dialog.component';
import { PlayerFriendRequestsComponent } from '../player-friend-requests/player-friend-requests.component';
import { PlayerFriendsComponent } from '../player-friends/player-friends.component';
import { PlayerSettingsComponent } from '../player-settings/player-settings.component';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';

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

  gameView = 0;
  friendsRequestsCount = 2;
  isChatOpen = false;

  chatMessages = [
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fugit unde ut deserunt, tenetur illo laboriosam, nemo, nihil molestias iste atque accusamus inventore dolore debitis porro deleniti cumque. Perferendis, dolor! Ipsum.",
  ]
  constructor(private api: ApiService, private route: ActivatedRoute, public dialog: Dialog) {

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
        privacy: false
      }
    });
  }

  openFriendsListDialog(): void {
    const dialogRef = this.dialog.open<string>(PlayerFriendsComponent);
  }
  openFriendsSearchDialog(): void {
    const dialogRef = this.dialog.open<string>(PlayerFriendsComponent);
  }
  openFriendsRequestsDialog(): void {
    const dialogRef = this.dialog.open<string>(PlayerFriendRequestsComponent)
  }

  ngOnInit(): void {
    //window.addEventListener('keydown', this.keyPress, false);
  }
}
