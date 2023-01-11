import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
    translateM4x4,
    toRadians,
    scaleM4x4,
    lookAtLH,
    perspectiveLH,
    mat4x4Mul,
    vec4,
    vec4x4,
    vec3
} from './vector';

import {
    cubeVertices,
    sphereVertices,
    cylinderVertices
} from './objects';

import {
    simpleVertexShader,
    simpleFragmentShader,
    lightFragmentShader,
    lightVertexShader
} from './shader';

import {
  GameState,
  tranCreateProgram,
  tranLoadShader,
  createBufferObject,
  drawCube,
  drawSphere
} from './render';

import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Input } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute } from '@angular/router';

//import * as render from './render';

type KeyState = 
{
  action: string;
  state: string;
};




@Component({
  selector: 'app-pong-game-v2',
  templateUrl: './pong-game-v2.component.html',
  styleUrls: ['./pong-game-v2.component.less']
})
export class PongGameComponentV2 implements OnInit {

  @ViewChild("pongcanvas") canvas!: ElementRef<HTMLCanvasElement>;
  glContext!: WebGL2RenderingContext | null;

  KeyStates : KeyState[] = [
    {action: "UP", state: "UP"},
    {action: "DOWN", state: "UP"},
    {action: "START_GAME", state: "UP"},
  ];

  camChosen:number = 0;
  mode:number = 1;
  ColorClear:vec4 = [220.0 / 255.0, 220.0 / 255.0, 220.0 / 255.0, 1.0];

  lightColor:vec4 = [1.0, 1.0, 1.0, 1.0];
  lightPosition:vec3 = [0.0, 250.0, 0.0];
  ambientStrength:number = 0.2;

  ballRadius:number = 5.0;
  ballDimensions:vec3 = [this.ballRadius, this.ballRadius, this.ballRadius];
  ballColor:vec4 = [223.0 /255.0, 1.0, 79.0 / 255.0, 1.0];
  ballClassicColor:vec4 = [210.0 / 255.0, 127.0 / 255.0, 128.0 / 255.0, 1.0];

  fieldDimensions:vec3 = [512.0, 0.1, 256.0];
  fieldPosition:vec3 = [0.0, -this.ballRadius, 0.0];
  fieldColor:vec4 = [80.0 / 255.0, 200.0 / 255.0, 10.0 / 255.0, 1.0];
  fieldClassicColor:vec4 = [83.0 / 255.0, 104.0 / 255.0, 120.0 / 255.0, 1.0];

  tableColor:vec4 = [124.0 / 255.0, 63.0 / 255.0, 0.0, 1.0];
  sideDimensions:vec3 = [this.fieldDimensions[0] - 10.0, 4.0, 4.0];
  leftSidePosition :vec3 = [0.0, 0.0, (this.fieldDimensions[2] + this.sideDimensions[2]) / 2.0];

  baseTableDimensions:vec3 = [this.fieldDimensions[0], 15.0, this.fieldDimensions[2] + 8.0];
  baseTablePosition:vec3 = [
    this.fieldPosition[0],
    this.fieldPosition[1] - this.fieldDimensions[1] - (this.baseTableDimensions[1] / 2.0),
    this.fieldPosition[2]
  ];


  feetDisplacement:number = 10.0;
  footDimension:vec3 = [10.0, 80.0, 10.0];
  feetPositions = [
      [(this.fieldDimensions[0] / 2.0) - this.feetDisplacement, this.fieldPosition[1] - this.fieldDimensions[1] - (this.footDimension[1] / 2.0), (this.fieldDimensions[2] / 2.0) - this.feetDisplacement],
      [-(this.fieldDimensions[0] / 2.0) + this.feetDisplacement, this.fieldPosition[1] - this.fieldDimensions[1] - (this.footDimension[1] / 2.0), (this.fieldDimensions[2] / 2.0) - this.feetDisplacement],
      [(this.fieldDimensions[0] / 2.0) - this.feetDisplacement, this.fieldPosition[1] - this.fieldDimensions[1] - (this.footDimension[1] / 2.0), (-this.fieldDimensions[2] / 2.0) + this.feetDisplacement],
      [-(this.fieldDimensions[0] / 2.0) + this.feetDisplacement, this.fieldPosition[1] - this.fieldDimensions[1] - (this.footDimension[1] / 2.0), (-this.fieldDimensions[2] / 2.0) + this.feetDisplacement],
  ];


  middleLineDimensions:vec3 = [5.0, 0.1, 256.0];
  middleLinePosition:vec3 = [0.0, -this.ballRadius, 0.0];
  middleLineColor:vec4 = [1.0, 1.0, 1.0, 1.0];

  paddleDimensions:vec3 = [5.0, 5.0, 32.0];

  //TODO(yassine): get this from the player 
  classicPlayerColor:vec4 = [110.0 / 255.0, 127.0 / 255.0, 128.0 / 255.0, 1.0];;
  player1Color:vec4 = [227.0 / 255.0, 38.0 / 255.0, 51.0 / 255.0, 1.0];
  player2Color:vec4 = [0.0, 56.0 / 255.0, 123.0 / 255.0, 1.0];

  camClassicPosition:vec3 = [0.0, 200.0, 0.0];
  camPosition:vec3 = [0.0, 250.0, -120.0];
  camPlayer1Position:vec3 = [-420.0, 200.0, 0.0];
  camPlayer2Position:vec3 = [420.0, 200.0, 0.0];
  camAt:vec3 = [0.0, 0.0, 0.0];
  worldUp:vec3 = [0.0, 1.0, 0.0];
  worldUpClassic:vec3 = [0.0, 0.0, 1.0];

  FIELD_OF_VIEW:number = toRadians(80.0);
  NEAR:number = 0.1;
  FAR:number = 1000.0;

  SPACE_BAR = 70;
  ARROW_LEFT = 37;
  ARROW_RIGHT = 39;
  ARROW_UP = 38;
  ARROW_DOWN = 40;

  gameState: GameState = {
    p1Position : [0, 0, 0],
    p2Position : [0, 0, 0],
    ballPosition : [0, 0, 0],
    ballDirection : [0, 0, 0],
    score : [0, 0],
    serve : 0,
    gameStart : false,
    winner : 0,
  }

  shaderProgram: WebGLProgram | null | undefined;
  lightShaderProgram: WebGLProgram | null | undefined;
  cubeBufferObject?: WebGLBuffer | null;
  sphereBufferObject?: WebGLBuffer | null;

  // spectate
  // room

  socket?: Socket<ServerToClientEvents, ClientToServerEvents>;

  @Input() player: Player = {
    id: '-1',
    name: 'Rui Uemara',
    wins: 10,
    losses: 9,
    lvl: 9,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  player1: Player = {
    id: '-1',
    name: 'Rui Uemara',
    wins: 10,
    losses: 9,
    lvl: 9,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };

  player2: Player = {
    id: '-1',
    name: 'Rui Uemara',
    wins: 10,
    losses: 9,
    lvl: 9,
    status: 'online',
    avatar: '',
    email: '',
    twoFactor: false
  };


  // debug
  spectateRoom: string = '';

  // active
  active: boolean = false;

  // playerIds, populated from game.gateway
  playerIds: number[] = [-1, -1];

  // game ended ?
  gameEnded: boolean = false;
  winnerId: string = '-1';

  // pvp
  pvpRoomId: string = '';

  constructor(public api: ApiService, public route: ActivatedRoute) {
    console.log('canvas:', this.canvas);
    if (this.canvas) {
      this.glContext = this.canvas.nativeElement.getContext("webgl2");
    }
    console.log('glContext:', this.glContext);
    //render.init_canvas();
    //render.adjustCanvas();
    //render.main();
    //render.render();

    api.getPlayer().subscribe(
      (data) => {
        this.player = data;
        let cookies = Object.fromEntries(document.cookie.split(/; */).map(c => {
          const [ key, ...v ] = c.split('=');
          return [ key, decodeURIComponent(v.join('=')) ];
        }));

        this.socket = io(`${environment.baseUrl}/GAME`, {auth: {'id': this.player.id, 'token': cookies['auth-cookie']}});

        // spectate
        this.route.queryParamMap.subscribe(
          (params) => {
            var spectate = params.get('spectate');
            if (spectate != null && spectate != '') {
              this.spectateRoom = spectate;
              this.active = true;
              setTimeout(() => {
                this.loadGame();
              }, 1000);
            }
            else {
              var play = params.get('play');
              if (play != null && play != '') {
                this.active = true;
                setTimeout(() => {
                  if (play == 'custom')
                  {
                    this.mode = 1;
                  }
                  else {
                    this.mode = 0;
                  }
                  this.loadGame();
                }, 1000);
              }
              else {
                var pvp = params.get('pvp');
                if (pvp != null && pvp != '') {
                  this.active = true;
                  this.pvpRoomId = pvp;
                  setTimeout(() => {
                    this.mode = 1;
                    this.loadGame();
                  }, 1000)
                }
              }
            }
          }
        )
      }
    );
  }

  adjustCanvas()
  {
      this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
      this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
  }

  keyPress(event: KeyboardEvent)
  {
      //console.debug('pong-game-v2:keyPress', event);

      switch(event.keyCode)
      {
          case this.ARROW_UP:
              this.KeyStates[0].state = "DOWN";
              break;
          case this.ARROW_DOWN:
              this.KeyStates[1].state = "DOWN";
              break;
          case this.SPACE_BAR:
              this.KeyStates[2].state = "DOWN";
              break;
          case this.ARROW_LEFT:
          {
              if (this.camChosen == 1)
                  this.KeyStates[0].state = "DOWN";
              if (this.camChosen == 2)
                  this.KeyStates[1].state = "DOWN";
          }break;
          case this.ARROW_RIGHT:
          {
              if (this.camChosen == 1)
                  this.KeyStates[1].state = "DOWN";
              if (this.camChosen == 2)
                  this.KeyStates[0].state = "DOWN";
          }break;
          case 'C'.charCodeAt(0):
          {
              this.camChosen++;
              this.camChosen %= 3;
          }break;
          default:
              break;
      }
  }

  switchCamera(event: Event) {
    console.log(Event);
    this.camChosen++;
    this.camChosen %= 3;
  }

  keyUp(event: KeyboardEvent)
  {
      //console.debug('pong-game-v2:keyUp', event);

      switch(event.keyCode)
      {
          case this.ARROW_UP:
              this.KeyStates[0].state = "UP";
              break;
          case this.ARROW_DOWN:
              this.KeyStates[1].state = "UP";
              break;
          case this.ARROW_LEFT:
          {
              if (this.camChosen == 1)
                  this.KeyStates[0].state = "UP";
              if (this.camChosen == 2)
                  this.KeyStates[1].state = "UP";
          }break;
          case this.ARROW_RIGHT:
          {
              if (this.camChosen == 1)
                  this.KeyStates[1].state = "UP";
              if (this.camChosen == 2)
                  this.KeyStates[0].state = "UP";
          }break;
          case this.SPACE_BAR:
              this.KeyStates[2].state = "UP";
              break;
          default:
              break;
      }
  }

//   handleConnectionWithServer(state: GameState)
//   {
//     this.gameState = state;
//   }

  clearCanvas(canvas: HTMLCanvasElement, glContext: WebGL2RenderingContext)
  {
      glContext.viewport(0, 0, canvas.width, canvas.height);
      glContext.clearColor(this.ColorClear[0], this.ColorClear[1], this.ColorClear[2], this.ColorClear[3]);
      glContext.clear(glContext.DEPTH_BUFFER_BIT | glContext.COLOR_BUFFER_BIT);
  }

  main()
  {
      //socket = io("https://dev-chat.trt.foobarandlmj.xyz/GAME");

      if (this.socket)
      {
        // debug only
        if (this.spectateRoom) {
          this.socket.emit("SpectateGameRequest", this.spectateRoom);
        }
        else if (this.pvpRoomId) {
          this.socket.emit("pvpConnectionRequest", [this.pvpRoomId, Number(this.player.id)])
          console.log('pong-game:emit:pvpConnectionMSG', [this.pvpRoomId, Number(this.player.id)])
        }
        else {
          this.socket.emit("connectionMSG", "PLAYER");
        }

      }
      // Todo: if spectate mode: SpectateGameRequest , RoomId

      if (this.glContext == null) {
        console.warn("loadGame:main:glContext is null");
        return;
      }

      this.clearCanvas(this.canvas.nativeElement, this.glContext);
      this.glContext.enable(this.glContext.DEPTH_TEST);

      this.shaderProgram = tranCreateProgram(this.glContext, simpleVertexShader, simpleFragmentShader);
      this.lightShaderProgram = tranCreateProgram(this.glContext, lightVertexShader, lightFragmentShader);
      if (this.mode == 0) {
          this.glContext.useProgram(this.shaderProgram);
      }
      else {
          this.glContext.useProgram(this.lightShaderProgram);
      }

      this.cubeBufferObject = createBufferObject(cubeVertices, this.glContext);
      this.sphereBufferObject = createBufferObject(sphereVertices, this.glContext);
      // cylinderBufferObject = createBufferObject(cylinderVertices);
  }

  render(
    /*
      canvas: HTMLCanvasElement,
      socket: any,
      glContext: WebGL2RenderingContext,
      shaderProgram: WebGLProgram,
      lightShaderProgram: WebGLProgram,
      cubeBufferObject: WebGLBuffer,
      sphereBufferObject: WebGLBuffer,
      cylinderBufferObject: WebGLBuffer
      */
      )
  {
      if (this.socket)
      { 
          this.socket.emit('keysState', [this.KeyStates, this.gameState]);
          this.socket.on('ClientMSG', (state)=>
          {
            this.gameState = state;
          });
          this.socket.on('PlayerIds', (playerIds) => {
            if (playerIds[0] != this.playerIds[0] || playerIds[1] != this.playerIds[1]) {
              // changed
              //console.log("game:PlayerIds:", playerIds);
              this.playerIds = playerIds;
              if (playerIds[0] != 0) {
                this.api.getPlayerById(String(playerIds[0])).subscribe(
                  (data) => {
                    this.player1 = data;
                  }
                )
              }
              if (playerIds[1] != 0) {
                this.api.getPlayerById(String(playerIds[1])).subscribe(
                  (data) => {
                    this.player2 = data;
                  }
                )
              }
            }
            //this.playerIds = playerIds;
          })
          this.socket.on('END', (winnerId) => {
            this.gameEnded = true;
          })
          //console.log(this.gameState);
      }

      if (this.glContext == null) {
        console.warn("loadGame:main:glContext is null");
        return;
      }

      this.clearCanvas(this.canvas.nativeElement, this.glContext);

      const canvasRatio = this.canvas.nativeElement.width / this.canvas.nativeElement.height;
      const projection = perspectiveLH(this.FIELD_OF_VIEW, canvasRatio, this.NEAR, this.FAR);
      let view;
      if (this.mode == 0)
      {
          view = lookAtLH(this.camClassicPosition, this.camAt, this.worldUpClassic);
      }
      else
      {
          if (this.camChosen == 0)
              view = lookAtLH(this.camPosition, this.camAt, this.worldUp);
          else if (this.camChosen == 1)
              view = lookAtLH(this.camPlayer1Position, this.camAt, this.worldUp);
          else if (this.camChosen == 2)
              view = lookAtLH(this.camPlayer2Position, this.camAt, this.worldUp);
      }

      if (this.shaderProgram == null) {
        console.warn('loadGame:render:shaderProgram is null');
        return;
      }

      if (this.lightShaderProgram == null) {
        console.warn('loadGame:render:lightShaderProgram is null');
        return;
      }


      let projectionLoc;
      let viewLoc;
      let modelLoc;
      let objColorLoc;
      if (this.mode == 0)
      {
          projectionLoc = this.glContext.getUniformLocation(this.shaderProgram, "projection");
          viewLoc = this.glContext.getUniformLocation(this.shaderProgram, "view");
          modelLoc = this.glContext.getUniformLocation(this.shaderProgram, "model");
          objColorLoc = this.glContext.getUniformLocation(this.shaderProgram, "objColor");
      }
      if (this.mode == 1)
      {
          projectionLoc = this.glContext.getUniformLocation(this.lightShaderProgram, "projection");
          viewLoc = this.glContext.getUniformLocation(this.lightShaderProgram, "view");
          modelLoc = this.glContext.getUniformLocation(this.lightShaderProgram, "model");
          objColorLoc = this.glContext.getUniformLocation(this.lightShaderProgram, "objColor");

          const ambientStrengthLoc = this.glContext.getUniformLocation(this.lightShaderProgram, "ambientStrength");
          const lightColorLoc = this.glContext.getUniformLocation(this.lightShaderProgram, "lightColor");
          const lightPositionLoc = this.glContext.getUniformLocation(this.lightShaderProgram, "lightPosition");

          this.glContext.uniform4fv(lightColorLoc, this.lightColor);
          this.glContext.uniform3fv(lightPositionLoc, this.lightPosition);
          this.glContext.uniform1f(ambientStrengthLoc, this.ambientStrength);

      }

      if (this.cubeBufferObject == null) {
        console.warn("loadGame:render:cubeBufferObject is null");
        return;
      }

      //DRAW the Middle Line.

      let model = scaleM4x4(this.middleLineDimensions[0], this.middleLineDimensions[1], this.middleLineDimensions[2]);
      model = mat4x4Mul(model, translateM4x4(this.middleLinePosition[0], this.middleLinePosition[1], this.middleLinePosition[2]));

      if (projectionLoc == null || viewLoc == null || modelLoc == null || objColorLoc == null ||
          view == null) {
          return;
      }
      drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
          projection, view, model, this.middleLineColor, this.cubeBufferObject, this.glContext);

      //DRAW the field
      model = scaleM4x4(this.fieldDimensions[0], this.fieldDimensions[1], this.fieldDimensions[2]);
      model = mat4x4Mul(model, translateM4x4(this.fieldPosition[0], this.fieldPosition[1], this.fieldPosition[2]));

      if (this.mode == 0)
      {
          drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
              projection, view, model, this.fieldClassicColor, this.cubeBufferObject,this.glContext);
      }
      else
      {
          drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
              projection, view, model, this.fieldColor, this.cubeBufferObject, this.glContext);
      }
      //DRAW the P1

      model = scaleM4x4(this.paddleDimensions[0], this.paddleDimensions[1], this.paddleDimensions[2]);
      model = mat4x4Mul(model, translateM4x4(this.gameState.p1Position[0], this.gameState.p1Position[1], this.gameState.p1Position[2]));

      if (this.mode == 0)
      {
          drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
              projection, view, model, this.classicPlayerColor, this.cubeBufferObject, this.glContext);
      }
      else{
          //TODO(yassine): player1Color query this form the database.
          drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
              projection, view, model, this.player1Color, this.cubeBufferObject, this.glContext);
      }

      //DRAW the P2

      model = scaleM4x4(this.paddleDimensions[0], this.paddleDimensions[1], this.paddleDimensions[2]);
      model = mat4x4Mul(model, translateM4x4(this.gameState.p2Position[0], this.gameState.p2Position[1], this.gameState.p2Position[2]));

      //TODO(yassine): player1Color query this form the database.
      if (this.mode == 0)
      {
          drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
              projection, view, model, this.classicPlayerColor, this.cubeBufferObject, this.glContext);
      }
      else{
          //TODO(yassine): player1Color query this form the database.
          drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
              projection, view, model, this.player2Color, this.cubeBufferObject, this.glContext);
      }

      if (this.mode == 1)
      {
          model = scaleM4x4(this.sideDimensions[0], this.sideDimensions[1], this.sideDimensions[2]);
          model = mat4x4Mul(model, translateM4x4(this.leftSidePosition[0], this.leftSidePosition[1], this.leftSidePosition[2]));

          drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
                  projection, view, model, this.tableColor, this.cubeBufferObject, this.glContext);

          model = scaleM4x4(this.sideDimensions[0], this.sideDimensions[1], this.sideDimensions[2]);
          model = mat4x4Mul(model, translateM4x4(this.leftSidePosition[0], this.leftSidePosition[1], -this.leftSidePosition[2]));

          drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
                  projection, view, model, this.tableColor, this.cubeBufferObject, this.glContext);

          model = scaleM4x4(this.baseTableDimensions[0], this.baseTableDimensions[1], this.baseTableDimensions[2] + (this.sideDimensions[2] / 2.0));
          model = mat4x4Mul(model, translateM4x4(this.baseTablePosition[0], this.baseTablePosition[1], this.baseTablePosition[2]));

          drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
              projection, view, model, this.tableColor, this.cubeBufferObject, this.glContext);

          for (let i = 0; i < 4; i++)
          {
              model = scaleM4x4(this.footDimension[0], this.footDimension[1], this.footDimension[2]);
              model = mat4x4Mul(model, translateM4x4(this.feetPositions[i][0], this.feetPositions[i][1], this.feetPositions[i][2]));
              drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc, projection, view, model, this.tableColor, this.cubeBufferObject, this.glContext);
          }
      }

      //DRAW the BALL.

      if (this.sphereBufferObject == null) {
        console.warn("loadGame:render:sphereBufferObject is null");
        return;
      }

      model = scaleM4x4(this.ballDimensions[0], this.ballDimensions[1], this.ballDimensions[2]);
      model = mat4x4Mul(model, translateM4x4(this.gameState.ballPosition[0], this.gameState.ballPosition[1], this.gameState.ballPosition[2]));

      if (this.mode == 0)
      {
          drawSphere(projectionLoc, viewLoc, modelLoc, objColorLoc,
              projection, view, model, this.ballClassicColor, this.sphereBufferObject
              , this.glContext);    
      }
      else{
          //TODO(yassine): player1Color query this form the database.
          drawSphere(projectionLoc, viewLoc, modelLoc, objColorLoc,
              projection, view, model, this.ballColor, this.sphereBufferObject, this.glContext);
          
      }

      window.requestAnimationFrame(() => this.render());
  }

  loadGame():void {
    this.adjustCanvas();
    if (this.canvas) {
      this.glContext = this.canvas.nativeElement.getContext("webgl2");
    }
    this.main();
    this.render();
    window.addEventListener('resize', () => this.adjustCanvas, true);
    window.addEventListener('keydown', (event) => this.keyPress(event), false);
    window.addEventListener('keyup', (event) => this.keyUp(event), false);
    console.debug('loadGame: done');
    console.debug('loadGame:player', this.player);
  }

  launchCustomMode(): void {
    //console.log('startSpectateGame:', game);
    //this.location.go('/spectate',`roomId=${game.roomId}`)
    window.open(`/default?play=custom`, '_self')?.focus();
  }

  launchClassicMode(): void {
    //console.log('startSpectateGame:', game);
    //this.location.go('/spectate',`roomId=${game.roomId}`)
    window.open(`/default?play=classic`, '_self')?.focus();
  }


  ngOnInit(): void {
    //this.loadGame();
    //let node = document.createElement('script');
    //node.src = "assets/render.js";
    //node.type = "text/javascript";
    //node.async = true;
    //document.getElementsByTagName('head')[0].appendChild(node);
 }

}
