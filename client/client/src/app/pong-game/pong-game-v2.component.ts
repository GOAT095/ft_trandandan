import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as render from './render';

@Component({
  selector: 'app-pong-game-v2',
  templateUrl: './pong-game.component.html',
  styleUrls: ['./pong-game.component.less']
})
export class PongGameComponentV2 implements OnInit {

  @ViewChild("pongcanvas") canvas!: ElementRef<HTMLCanvasElement>;
  glContext!: WebGL2RenderingContext | null;

  constructor() {
    console.log(this.canvas);
    if (this.canvas) {
      this.glContext = this.canvas.nativeElement.getContext("webgl2");
    }
    console.log(this.glContext);
    //render.init_canvas();
    //render.adjustCanvas();
    //render.main();
    //render.render();
 }

  ngOnInit(): void {
    let node = document.createElement('script');
    node.src = "assets/render.js";
    node.type = "text/javascript";
    node.async = true;
    document.getElementsByTagName('head')[0].appendChild(node);
 }

}
