import { Dialog } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OauthDialogComponent } from '../oauth-dialog/oauth-dialog.component';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.less']
})
export class DefaultComponent implements OnInit {
  oauthUrl : string = environment.oauthUrl;
  constructor(public dialog: Dialog) { }

  openLogin(): void {
    window.open(this.oauthUrl, '_self')
  }
  ngOnInit(): void {
  }

  openOAuthSelectDialog() {
    this.dialog.open<string>(OauthDialogComponent);
  }

}
