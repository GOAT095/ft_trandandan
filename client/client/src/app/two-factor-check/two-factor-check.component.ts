import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-two-factor-check',
  templateUrl: './two-factor-check.component.html',
  styleUrls: ['./two-factor-check.component.less']
})
export class TwoFactorCheckComponent implements OnInit {

  code: string = '';
  token: string = '';
  constructor(public api: ApiService, public route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(
      (params) => {
        let token = params.get('token');
        if (token != null) {
          this.token = token
        }
      }
    )
  }

  check(): void {
    console.debug('code = ', this.code)
    this.api.http.post(`${this.api.apiUrl}/2fa/check`,{ code: this.code, token: this.token }).subscribe(
      (data) => {
        console.debug("data = ", data);
        window.open("/default", "_self");
      }
    )
  }
  ngOnInit(): void {
  }

}
