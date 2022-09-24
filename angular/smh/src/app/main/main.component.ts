import { Component, OnInit } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {

  player : Player = {name: '---', wins: 0, lvl: 0, losses: 0, status: 'online'};
  constructor(private api: ApiService) {
    api.http.get<Player>(`${api.apiUrl}/user/me`, {withCredentials: true}).subscribe(
      (data) => {
        this.player = data;
        console.debug(data);
      }
    )
  }


  logout(): void {
    // Unset cookie
    document.cookie = 'auth-cookie=; Max-Age=-99999999;'
    window.open("/", "_self")
  }
  ngOnInit(): void {
  }

}
