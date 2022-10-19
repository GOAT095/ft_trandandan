import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.less']
})
export class DefaultComponent implements OnInit {
  apiUrl : string = 'https://api.intra.42.fr/oauth/authorize?client_id=b97a1bd7c20d72ce867716a43253b0fc4ecdc37d0427db54ffed338300208761&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fredirect&response_type=code'
  constructor() { }

  openLogin(): void {
    window.open(this.apiUrl, '_self')
  }
  ngOnInit(): void {
  }

}
