import { Component, OnInit, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'app-main-offline-dialog',
  templateUrl: './main-offline-dialog.component.html',
  styleUrls: ['./main-offline-dialog.component.less']
})
export class MainOfflineDialogComponent implements OnInit {

  errorStr = "Undefined";

  constructor(public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public data: any) {
    this.errorStr = data.errorStr;
  }

  ngOnInit(): void {
  }

  redirectToRoot(): void {
    window.open("/", "_self");
  }
}
