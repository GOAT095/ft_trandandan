import { Component, OnInit } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {

  player : Player = {
    id: '-1',
    name: '---',
    wins: 0, lvl: 0, losses: 0,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  constructor(private api: ApiService) {
    api.getPlayer().subscribe(
      (data) => {
        this.player = data;
      }
    )
  }
  updatePlayer(player: Player) {
    this.player = player;
  }
  logout(): void {
    // Unset cookie
    this.api.http.get(`${this.api.apiUrl}/auth/logout/${this.player.id}`, {withCredentials: true}).subscribe(
      () => {
        window.open("/", "_self");
      }
    );
  }
  ngOnInit(): void {
  }

}
