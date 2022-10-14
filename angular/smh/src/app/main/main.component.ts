import { Dialog } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { MainNewDialogComponent } from '../main-new-dialog/main-new-dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {

  first_login : boolean = false;
  player : Player = {
    id: '-1',
    name: '---',
    wins: 0, lvl: 0, losses: 0,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  constructor(private api: ApiService, private route: ActivatedRoute, public dialog: Dialog) {
    this.route.queryParamMap.subscribe(
      (params) => {
        var param = params.get('new')
        if (param != null && param == 'true') {
          this.first_login  = true;
        }
      }
    )
    api.getPlayer().subscribe(
      (data) => {
        this.player = data;
        this.openFirstLoginDialog();
      }
    )
    console.debug('Initialized MainComponent', this.first_login, this.player);
  }

  openFirstLoginDialog(): void {
    const dialogRef = this.dialog.open<string>(MainNewDialogComponent, {
      data: {player: this.player}
    });
    dialogRef.closed.subscribe(result => {
      console.debug('MainNewDialogComponent closed')
    })
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
