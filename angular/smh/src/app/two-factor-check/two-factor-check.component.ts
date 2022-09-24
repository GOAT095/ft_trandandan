import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-two-factor-check',
  templateUrl: './two-factor-check.component.html',
  styleUrls: ['./two-factor-check.component.less']
})
export class TwoFactorCheckComponent implements OnInit {

  code: string = '';
  constructor(public api: ApiService) { }

  check(): void {
    console.debug('code = ', this.code)
    this.api.http.post(`${this.api.apiUrl}/2fa/check`,{ code: this.code }).subscribe(
      (data) => {
        console.debug("data = ", data);
        window.open("/default", "_self");
      }
    )
  }
  ngOnInit(): void {
  }

}
