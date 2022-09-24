import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-player-settings',
  templateUrl: './player-settings.component.html',
  styleUrls: ['./player-settings.component.less']
})
export class PlayerSettingsComponent implements OnInit {

  player : Player = {name: '---', wins: 0, lvl: 0, losses: 0, status: 'online'};
  // Editable data
  username : string = '';

  constructor(private api: ApiService) {
    api.http.get<Player>(`${api.apiUrl}/user/me`, {withCredentials: true}).subscribe(
      (data) => {
        this.player = data;
        console.debug(data);
      }
    )
  }
  updateUsername(): void {
    console.log("TODO: send POST with : " + this.username);
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
