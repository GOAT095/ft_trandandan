import { Component, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { WsService } from './ws.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'ft_transcendence';
  constructor(public api: ApiService, public ws: WsService) {}
}
