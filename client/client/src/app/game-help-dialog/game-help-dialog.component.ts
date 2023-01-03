import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-help-dialog',
  templateUrl: './game-help-dialog.component.html',
  styleUrls: ['./game-help-dialog.component.less']
})
export class GameHelpDialogComponent implements OnInit {

  constructor(public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
  }

}
