import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.less']
})
export class ActionButtonComponent {
  animal: string | undefined;
  name: string = "";

  @Output()
  onClose = new EventEmitter();

  constructor(public dialog: Dialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open<string>(PromptDialogComponent, {
      //width: '250px',
      data: {name: this.name, animal: this.animal}
    });
    dialogRef.closed.subscribe(result => {
      console.log('The dialog was closed' + ' result = ' + result);
      this.onClose.emit(result);
    })
  }

}

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.less']
})
export class PromptDialogComponent {
  constructor(public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public data: DialogData) {}
}
