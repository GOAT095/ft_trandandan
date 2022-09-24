import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-player-settings',
  templateUrl: './player-settings.component.html',
  styleUrls: ['./player-settings.component.less']
})
export class PlayerSettingsComponent implements OnInit {

  @Input()
  player : Player = {id: '-1', name: '---', wins: 0, lvl: 0, losses: 0, status: 'online'};
  // Editable data
  username : string = '';
  avatar : File = new File([], '');

  constructor(private api: ApiService) {}
  updateUsername(): void {
    this.api.updatePlayerUsername(this.username, this.player.id).subscribe(
      (data) => {
        this.player = data;
        location.reload();
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
      }
    );
  }
  ngOnInit(): void {
  }

}

export interface TwoFactorDialogData {

}

@Component({
  selector: 'app-two-factor-action-button',
  templateUrl: './two-factor-action-button.component.html',
  styleUrls: ['./two-factor-action-button.component.less']
})
export class TwoFactorActionButtonComponent {
  constructor(public dialog: Dialog) {}
  openDialog(): void {
    console.log("2fa dialog");
    const dialogRef = this.dialog.open<string>(TwoFactorDialogPromptComponent, {
      data: {},
    });
    dialogRef.closed.subscribe(result => {
      console.log('The TwoFactorDialogPrompt was closed, result =  ' + result);
    })
  }
}

@Component({
  selector: 'app-two-factor-dialog-prompt',
  templateUrl: './two-factor-dialog-prompt.component.html',
  styleUrls: ['./two-factor-dialog-prompt.component.less']
})
export class TwoFactorDialogPromptComponent {
  constructor(public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public data: TwoFactorDialogData) {}
}
