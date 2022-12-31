import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pong-game',
  templateUrl: './pong-game.component.html',
  styleUrls: ['./pong-game.component.less']
})
export class PongGameComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    let node = document.createElement('script');
    node.src = "assets/render.js";
    node.type = "text/javascript";
    node.async = true;
    document.getElementsByTagName('head')[0].appendChild(node);
  }

}
