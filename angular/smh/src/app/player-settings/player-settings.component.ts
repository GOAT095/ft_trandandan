import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-player-settings',
  templateUrl: './player-settings.component.html',
  styleUrls: ['./player-settings.component.less']
})
export class PlayerSettingsComponent implements OnInit {

  @Input()
  player : Player = {
    id: '-1',
    name: '---',
    wins: 0, lvl: 0, losses: 0,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  // Editable data
  username : string = '';
  avatar : File = new File([], '');

  // output event
  @Output()
  playerUpdateEvent = new EventEmitter<Player>();

  constructor(private api: ApiService) {}
  updateUsername(): void {
    this.api.updatePlayerUsername(this.username, this.player.id).subscribe(
      (data) => {
        this.player = data;
        this.playerUpdateEvent.emit(data);
      }
    )
  }
  selectAvatar(event: Event): void {
    let files = (event.target as HTMLInputElement).files;
    if (files == null)
      return;
    if (files.length != 0) {
      this.avatar = files[0];
    }
  }
  updateAvatar(): void {
    // TODO : ~~check this.avatar~~ api throws BadRequest
    this.api.updateAvatar(this.avatar).subscribe(
      (data) => {
        this.player = data;
        this.playerUpdateEvent.emit(data);
      }
    );
  }
  onDialogButtonClose(result: string) {
    if (result == 'ok') {
      this.api.disable2fa().subscribe(() => {
        this.player.twoFactor = false;
        console.log('2fa disabled!')
      });
    }
  }
  updatePlayer(player: Player) {
    this.player.twoFactor = player.twoFactor;
  }
  ngOnInit(): void {
  }

}

export interface TwoFactorDialogData {
  src: string,
  code: string,
}

@Component({
  selector: 'app-two-factor-action-button',
  templateUrl: './two-factor-action-button.component.html',
  styleUrls: ['./two-factor-action-button.component.less']
})
export class TwoFactorActionButtonComponent {
  reader = new FileReader();
  constructor(public dialog: Dialog, public api: ApiService) {}

  @Input()
  player : Player = {
    id: '-1',
    name: '---',
    wins: 0, lvl: 0, losses: 0,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  @Output()
  playerUpdateEvent = new EventEmitter<Player>();

  openDialog(): void {
    console.log("2fa dialog");
    this.api.generateQRCode().subscribe(
      (blob) => {
        this.reader.readAsDataURL(blob);
        this.reader.onloadend = () => {
          const dialogRef = this.dialog.open<string>(TwoFactorDialogPromptComponent, {
            data: {
              src: this.reader.result
            },
          });
          dialogRef.closed.subscribe(result => {
            console.log('The TwoFactorDialogPrompt was closed, result =  ' + result);
            if (result == 'enabled') {
              this.player.twoFactor = true;
              this.playerUpdateEvent.emit(this.player);
              console.log(this.player)
            }
          })
        }
      }
    )
  }
}

@Component({
  selector: 'app-two-factor-dialog-prompt',
  templateUrl: './two-factor-dialog-prompt.component.html',
  styleUrls: ['./two-factor-dialog-prompt.component.less']
})
export class TwoFactorDialogPromptComponent {
  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA) public data: TwoFactorDialogData,
    public api: ApiService
  ) {}
  turnOn() {
    this.api.enable2fa(this.data.code).subscribe(() => {
      console.log('2fa enabled !');
      this.dialogRef.close('enabled');
    })
  }
}
