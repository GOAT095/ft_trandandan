import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.less']
})
export class DefaultComponent implements OnInit {
  oauthUrl : string = environment.oauthUrl;
  constructor() { }

  openLogin(): void {
    window.open(this.oauthUrl, '_self')
  }
  ngOnInit(): void {
  }

}
