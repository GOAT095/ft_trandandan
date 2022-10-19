import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-global-background',
  templateUrl: './global-background.component.html',
  styleUrls: ['./global-background.component.less']
})
export class GlobalBackgroundComponent implements OnInit {

  constructor() {
    //console.log(document.body.clientWidth, document.body.clientHeight);
   }

  ngOnInit(): void { }

  ngAfterViewChecked(): void {
    // TODO:
    //  - Animate pong ball
    //  - Refresh canvas on window size updates !

    const self : HTMLElement | null = document.getElementById("app-global-background")
    if (self == null) {
      console.error('document.getElementById("app-global-background") returned "null"')
      
      return
    }

    const canvas_collection : HTMLCollectionOf<HTMLCanvasElement> = self.getElementsByTagName("canvas");
    if (canvas_collection.length == 0) {
      console.error('self.getElementsByTagName("canvas").length == 0')
      return
    }

    let canvas : HTMLCanvasElement | null = canvas_collection.item(0);
    if (canvas == null) {
      console.error('canvas_collection.item(0) returned "null"')
      return
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx : CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (ctx == null) {
      return
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height)

  }
}
