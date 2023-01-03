import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-oauth-dialog',
  templateUrl: './oauth-dialog.component.html',
  styleUrls: ['./oauth-dialog.component.less']
})
export class OauthDialogComponent implements OnInit {

  IntraOAuthUrl : string = environment.oauthUrl;
  GithubOAuthUrl : string = environment.githubOAuthUrl;

  constructor() { }

  ngOnInit(): void {
  }

  loginWith42Intra() {
    window.open(this.IntraOAuthUrl, '_self');
  }

  loginWithGithub() {
    window.open(this.GithubOAuthUrl, '_self');
  }

}
