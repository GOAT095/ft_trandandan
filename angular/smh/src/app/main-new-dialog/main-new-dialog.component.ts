import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-new-dialog',
  templateUrl: './main-new-dialog.component.html',
  styleUrls: ['./main-new-dialog.component.less']
})
export class MainNewDialogComponent implements OnInit {

  // TODO: update on change
  player : Player = {
    id: '-1',
    name: '---',
    wins: 0, lvl: 0, losses: 0,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  constructor(public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public data: any) {
    this.player = data.player;
    console.debug("Initialized MainNewDialogComponent", data);
  }

  ngOnInit(): void {
  }

}
