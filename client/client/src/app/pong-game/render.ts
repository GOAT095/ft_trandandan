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

import { io } from 'socket.io-client';
import { getLocaleNumberFormat } from '@angular/common';

//var canvas : HTMLCanvasElement = document.getElementById("pongcanvas") as HTMLCanvasElement;
//var glContext = canvas.getContext("webgl2");

//console.log(glContext);

//let shaderProgram;
//let lightShaderProgram;
//let sphereBufferObject;
//let cubeBufferObject;
//let socket;



export function tranLoadShader(glContext: WebGL2RenderingContext, shaderSource: string, shaderType: number)
{
    let resultShader = glContext.createShader(shaderType);
    if (resultShader == null)
        return null;
    glContext.shaderSource(resultShader, shaderSource);
    glContext.compileShader(resultShader);
    if (!glContext.getShaderParameter(resultShader, glContext.COMPILE_STATUS)){
        console.error(glContext.getShaderInfoLog(resultShader));
    }
    return (resultShader);
}

export function tranCreateProgram(glContext: WebGL2RenderingContext,
    vsShaderSource: string, fgShaderSource: string)
{
    let resultProgram:WebGLProgram|null;
    const vertexShader = tranLoadShader(glContext, vsShaderSource, glContext.VERTEX_SHADER);
    const fragmentShader = tranLoadShader(glContext, fgShaderSource, glContext.FRAGMENT_SHADER);
    if (vertexShader == null || fragmentShader == null){
        return null;
    }
    resultProgram = glContext.createProgram();
    if (resultProgram == null) {
        return null;
    }
    glContext.attachShader(resultProgram, vertexShader);
    glContext.attachShader(resultProgram, fragmentShader);
    glContext.linkProgram(resultProgram);
    if (!glContext.getProgramParameter(resultProgram, glContext.LINK_STATUS)){
        console.error(glContext.getProgramInfoLog(resultProgram));
    }
    return (resultProgram);
}

enum Serve
{
  PONE = 0,
  PTWO
};

enum Winner
{
  NONE = 0,
  PONE,
  PTWO
};

class GameState
{
  p1Position : [number, number, number];
  p2Position : [number, number, number];
  ballPosition : [number, number, number];
  ballDirection : [number, number, number];
  score : [number, number];
  serve : Serve;
  gameStart : boolean;
  winner : Winner;
  // player : Player;

  constructor()
  {
    this.p1Position = [-fieldDimensions[0] / 2.0, 0.0, 0.0];
    this.p2Position = [fieldDimensions[0] / 2.0, 0.0, 0.0];
    this.score = [0.0, 0.0];
    this.serve = Serve.PONE;
    this.gameStart = false;
    if (this.serve == Serve.PONE)
    {
      this.ballPosition = [(-fieldDimensions[0] * 0.5) + (ballRadius * 2.0), 0.0, 0.0];
      this.ballDirection = [1.0, 0.0, 0.0];
    }
    else
    {
      this.ballPosition = [(fieldDimensions[0] * 0.5) - (ballRadius * 2.0), 0.0, 0.0];
      this.ballDirection = [-1.0, 0.0, 0.0];
    }
    this.winner = Winner.NONE;
    // this.player = Player.PONE;
  }
};

let gameState: GameState = {
    p1Position : [0, 0, 0],
    p2Position : [0, 0, 0],
    ballPosition : [0, 0, 0],
    ballDirection : [0, 0, 0],
    score : [0, 0],
    serve : 0,
    gameStart : false,
    winner : 0,
}

type KeyState = 
{
  action: string;
  state: string;
};

let KeyStates : KeyState[] = [
    {action: "UP", state: "UP"},
    {action: "DOWN", state: "UP"},
    {action: "START_GAME", state: "UP"},
];

let camChosen:number = 0;
let mode:number = 1;
const ColorClear:vec4 = [220.0 / 255.0, 220.0 / 255.0, 220.0 / 255.0, 1.0];

const lightColor:vec4 = [1.0, 1.0, 1.0, 1.0];
const lightPosition:vec3 = [0.0, 250.0, 0.0];
const ambientStrength:number = 0.2;

const ballRadius:number = 5.0;
const ballDimensions:vec3 = [ballRadius, ballRadius, ballRadius];
let   ballColor:vec4 = [223.0 /255.0, 1.0, 79.0 / 255.0, 1.0];
let   ballClassicColor:vec4 = [210.0 / 255.0, 127.0 / 255.0, 128.0 / 255.0, 1.0];

const fieldDimensions:vec3 = [512.0, 0.1, 256.0];
const fieldPosition:vec3 = [0.0, -ballRadius, 0.0];
let   fieldColor:vec4 = [80.0 / 255.0, 200.0 / 255.0, 120.0 / 255.0, 1.0];
const fieldClassicColor:vec4 = [83.0 / 255.0, 104.0 / 255.0, 120.0 / 255.0, 1.0];

const tableColor:vec4 = [124.0 / 255.0, 63.0 / 255.0, 0.0, 1.0];
const sideDimensions:vec3 = [fieldDimensions[0] - 10.0, 4.0, 4.0];
const leftSidePosition :vec3 = [0.0, 0.0, (fieldDimensions[2] + sideDimensions[2]) / 2.0];

const baseTableDimensions:vec3 = [fieldDimensions[0], 15.0, fieldDimensions[2] + 8.0];
const baseTablePosition:vec3 = [fieldPosition[0], fieldPosition[1] - fieldDimensions[1] - (baseTableDimensions[1] / 2.0), fieldPosition[2]];


const feetDisplacement:number = 10.0;
const footDimension:vec3 = [10.0, 80.0, 10.0];
let feetPositions = [
    [(fieldDimensions[0] / 2.0) - feetDisplacement, fieldPosition[1] - fieldDimensions[1] - (footDimension[1] / 2.0), (fieldDimensions[2] / 2.0) - feetDisplacement],
    [-(fieldDimensions[0] / 2.0) + feetDisplacement, fieldPosition[1] - fieldDimensions[1] - (footDimension[1] / 2.0), (fieldDimensions[2] / 2.0) - feetDisplacement],
    [(fieldDimensions[0] / 2.0) - feetDisplacement, fieldPosition[1] - fieldDimensions[1] - (footDimension[1] / 2.0), (-fieldDimensions[2] / 2.0) + feetDisplacement],
    [-(fieldDimensions[0] / 2.0) + feetDisplacement, fieldPosition[1] - fieldDimensions[1] - (footDimension[1] / 2.0), (-fieldDimensions[2] / 2.0) + feetDisplacement],
];


const middleLineDimensions:vec3 = [5.0, 0.1, 256.0];
const middleLinePosition:vec3 = [0.0, -ballRadius, 0.0];
const middleLineColor:vec4 = [1.0, 1.0, 1.0, 1.0];

const paddleDimensions:vec3 = [5.0, 5.0, 32.0];

//TODO(yassine): get this from the player 
let classicPlayerColor:vec4 = [110.0 / 255.0, 127.0 / 255.0, 128.0 / 255.0, 1.0];;
let player1Color:vec4 = [227.0 / 255.0, 38.0 / 255.0, 51.0 / 255.0, 1.0];
let player2Color:vec4 = [0.0, 56.0 / 255.0, 123.0 / 255.0, 1.0];

const camClassicPosition:vec3 = [0.0, 200.0, 0.0];
const camPosition:vec3 = [0.0, 250.0, -120.0];
const camPlayer1Position:vec3 = [-420.0, 200.0, 0.0];
const camPlayer2Position:vec3 = [420.0, 200.0, 0.0];
const camAt:vec3 = [0.0, 0.0, 0.0];
const worldUp:vec3 = [0.0, 1.0, 0.0];
const worldUpClassic:vec3 = [0.0, 0.0, 1.0];

const FIELD_OF_VIEW:number = toRadians(80.0);
const NEAR:number = 0.1;
const FAR:number = 1000.0;

const SPACE_BAR = 32;
const ARROW_LEFT = 37;
const ARROW_RIGHT = 39;
const ARROW_UP = 38;
const ARROW_DOWN = 40;
// const ESC_BUTTON = ;

//window.addEventListener('resize', adjustCanvas, true);
//window.addEventListener('keydown', keyPress, false);
//window.addEventListener('keyup', keyUp, false);

export function adjustCanvas(canvas: HTMLCanvasElement)
{
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function keyPress(event: KeyboardEvent)
{
    switch(event.keyCode)
    {
        case ARROW_UP:
            KeyStates[0].state = "DOWN";
            break;
        case ARROW_DOWN:
            KeyStates[1].state = "DOWN";
            break;
        case SPACE_BAR:
            KeyStates[2].state = "DOWN";
            break;
        case ARROW_LEFT:
        {
            if (camChosen == 1)
                KeyStates[0].state = "DOWN";
            if (camChosen == 2)
                KeyStates[1].state = "DOWN";
        }break;
        case ARROW_RIGHT:
        {
            if (camChosen == 1)
                KeyStates[1].state = "DOWN";
            if (camChosen == 2)
                KeyStates[0].state = "DOWN";
        }break;
        case 'C'.charCodeAt(0):
        {
            camChosen++;
            camChosen %= 3;
        }break;
        default:
            break;
    }
}

function keyUp(event: KeyboardEvent)
{
    switch(event.keyCode)
    {
        case ARROW_UP:
            KeyStates[0].state = "UP";
            break;
        case ARROW_DOWN:
            KeyStates[1].state = "UP";
            break;
        case ARROW_LEFT:
        {
            if (camChosen == 1)
                KeyStates[0].state = "UP";
            if (camChosen == 2)
                KeyStates[1].state = "UP";
        }break;
        case ARROW_RIGHT:
        {
            if (camChosen == 1)
                KeyStates[1].state = "UP";
            if (camChosen == 2)
                KeyStates[0].state = "UP";
        }break;
        case SPACE_BAR:
            KeyStates[2].state = "UP";
            break;
        default:
            break;
    }
}

function handleConnectionWithServer(state: GameState)
{
    gameState = state;
}

function clearCanvas(canvas: HTMLCanvasElement, glContext: WebGL2RenderingContext)
{
    glContext.viewport(0, 0, canvas.width, canvas.height);
    glContext.clearColor(ColorClear[0], ColorClear[1], ColorClear[2], ColorClear[3]);
    glContext.clear(glContext.DEPTH_BUFFER_BIT | glContext.COLOR_BUFFER_BIT);
}

function createBufferObject(vertices: Float32Array, glContext: WebGL2RenderingContext)
{
    let bufferObject = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, bufferObject);
    glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);
    glContext.vertexAttribPointer(0, 3, glContext.FLOAT, false, 6 * 4, 0);
    glContext.vertexAttribPointer(1, 3, glContext.FLOAT, false, 6 * 4, 3 * 4);
    glContext.enableVertexAttribArray(0);
    glContext.enableVertexAttribArray(1);
    return bufferObject;
}

function bindBufferObject(bufferObject: WebGLBuffer, glContext: WebGL2RenderingContext)
{
    glContext.bindBuffer(glContext.ARRAY_BUFFER, bufferObject);
    glContext.vertexAttribPointer(0, 3, glContext.FLOAT, false, 6 * 4, 0);
    glContext.vertexAttribPointer(1, 3, glContext.FLOAT, false, 6 * 4, 3 * 4);
    glContext.enableVertexAttribArray(0);
    glContext.enableVertexAttribArray(1);
}

function drawCube(
    projectionLoc:WebGLUniformLocation | null,
    viewLoc:WebGLUniformLocation,
    modelLoc:WebGLUniformLocation,
    objColorLoc:WebGLUniformLocation,
    projection: Float32List,
    view: Float32List,
    model: Float32List,
    objColor: Float32List,
    cubeBufferObject: WebGLBuffer,
    glContext: WebGL2RenderingContext)
{
    bindBufferObject(cubeBufferObject, glContext);

    glContext.uniformMatrix4fv(projectionLoc, false, projection);
    glContext.uniformMatrix4fv(viewLoc, false, view);
    glContext.uniformMatrix4fv(modelLoc, false, model);
    glContext.uniform4fv(objColorLoc, objColor);

    glContext.drawArrays(glContext.TRIANGLES, 0, cubeVertices.length / 6);
}

function drawSphere(
    projectionLoc:WebGLUniformLocation,
    viewLoc:WebGLUniformLocation,
    modelLoc:WebGLUniformLocation,
    objColorLoc:WebGLUniformLocation,
    projection:Float32List,
    view:Float32List,
    model:Float32List,
    objColor:Float32List,
    sphereBufferObject:WebGLBuffer,
    glContext: WebGL2RenderingContext)
{
    bindBufferObject(sphereBufferObject, glContext);


    glContext.uniformMatrix4fv(projectionLoc, false, projection);
    glContext.uniformMatrix4fv(viewLoc, false, view);
    glContext.uniformMatrix4fv(modelLoc, false, model);
    glContext.uniform4fv(objColorLoc, objColor);

    glContext.drawArrays(glContext.TRIANGLES, 0, sphereVertices.length / 6);
}


// function drawCylinder(projectionLoc, viewLoc, modelLoc, objColorLoc, projection, view, model, objColor)
// {
//     bindBufferObject(cylinderBufferObject);

//     glContext.uniformMatrix4fv(projectionLoc, false, projection);
//     glContext.uniformMatrix4fv(viewLoc, false, view);
//     glContext.uniformMatrix4fv(modelLoc, false, model);
//     glContext.uniform4fv(objColorLoc, objColor);

//     glContext.drawArrays(glContext.TRIANGLES, 0, cylinderBufferObject.length / 6);
// }


export async function main(
    canvas: HTMLCanvasElement,
    socket: any,
    glContext: WebGL2RenderingContext,
    shaderProgram: WebGLProgram | null,
    lightShaderProgram: WebGLProgram | null,
    cubeBufferObject: WebGLBuffer | null,
    sphereBufferObject: WebGLBuffer | null,
    cubeVertices: Float32Array,
    sphereVertices: Float32Array
    )
{
    //socket = io("https://dev-chat.trt.foobarandlmj.xyz/GAME");
    //TODO(yassine): this is temporary.
    if (socket)
    {
        socket.emit("connectionMSG", "PLAYER");
    //     //TODO(Yassine): Set the Player role here P1|P2 SPECTATOR.
    //     socket.on("ClientMSG", handleConnectionWithServer);
    //     // console.log(gameState);
    }

    clearCanvas(canvas, glContext);
    glContext.enable(glContext.DEPTH_TEST);

    shaderProgram = tranCreateProgram(glContext, simpleVertexShader, simpleFragmentShader);
    lightShaderProgram = tranCreateProgram(glContext, lightVertexShader, lightFragmentShader);
    if (mode == 0)
        glContext.useProgram(shaderProgram);
    else
        glContext.useProgram(lightShaderProgram);


    cubeBufferObject = createBufferObject(cubeVertices, glContext);
    sphereBufferObject = createBufferObject(sphereVertices, glContext);
    // cylinderBufferObject = createBufferObject(cylinderVertices);
}


export function render(canvas: HTMLCanvasElement,
    socket: any,
    glContext: WebGL2RenderingContext,
    shaderProgram: WebGLProgram,
    lightShaderProgram: WebGLProgram,
    cubeBufferObject: WebGLBuffer,
    sphereBufferObject: WebGLBuffer,
    cylinderBufferObject: WebGLBuffer
    )
{
    if (socket)
    { 
        socket.emit('keysState', [KeyStates, gameState]);
        socket.on('ClientMSG', handleConnectionWithServer);
    }
    clearCanvas(canvas, glContext);

    const canvasRatio = canvas.width / canvas.height;
    const projection = perspectiveLH(FIELD_OF_VIEW, canvasRatio, NEAR, FAR);
    let view;
    if (mode == 0)
    {
        view = lookAtLH(camClassicPosition, camAt, worldUpClassic);
    }
    else
    {
        if (camChosen == 0)
            view = lookAtLH(camPosition, camAt, worldUp);
        else if (camChosen == 1)
            view = lookAtLH(camPlayer1Position, camAt, worldUp);
        else if (camChosen == 2)
            view = lookAtLH(camPlayer2Position, camAt, worldUp);
    }

    let projectionLoc;
    let viewLoc;
    let modelLoc;
    let objColorLoc;
    if (mode == 0)
    {
        projectionLoc = glContext.getUniformLocation(shaderProgram, "projection");
        viewLoc = glContext.getUniformLocation(shaderProgram, "view");
        modelLoc = glContext.getUniformLocation(shaderProgram, "model");
        objColorLoc = glContext.getUniformLocation(shaderProgram, "objColor");
    }
    if (mode == 1)
    {
        projectionLoc = glContext.getUniformLocation(lightShaderProgram, "projection");
        viewLoc = glContext.getUniformLocation(lightShaderProgram, "view");
        modelLoc = glContext.getUniformLocation(lightShaderProgram, "model");
        objColorLoc = glContext.getUniformLocation(lightShaderProgram, "objColor");
        
        const ambientStrengthLoc = glContext.getUniformLocation(lightShaderProgram, "ambientStrength");
        const lightColorLoc = glContext.getUniformLocation(lightShaderProgram, "lightColor");
        const lightPositionLoc = glContext.getUniformLocation(lightShaderProgram, "lightPosition");

        glContext.uniform4fv(lightColorLoc, lightColor);
        glContext.uniform3fv(lightPositionLoc, lightPosition);
        glContext.uniform1f(ambientStrengthLoc, ambientStrength);

    }

    //DRAW the Middle Line.

    let model = scaleM4x4(middleLineDimensions[0], middleLineDimensions[1], middleLineDimensions[2]);
    model = mat4x4Mul(model, translateM4x4(middleLinePosition[0], middleLinePosition[1], middleLinePosition[2]));

    if (projectionLoc == null || viewLoc == null || modelLoc == null || objColorLoc == null ||
        view == null) {
        return;
    }
    drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
        projection, view, model, middleLineColor, cubeBufferObject,glContext);

    //DRAW the field
    model = scaleM4x4(fieldDimensions[0], fieldDimensions[1], fieldDimensions[2]);
    model = mat4x4Mul(model, translateM4x4(fieldPosition[0], fieldPosition[1], fieldPosition[2]));

    if (mode == 0)
    {
        drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
            projection, view, model, fieldClassicColor, cubeBufferObject,glContext);
    }
    else
    {
        drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
            projection, view, model, fieldColor, cubeBufferObject, glContext);
    }
    //DRAW the P1

    model = scaleM4x4(paddleDimensions[0], paddleDimensions[1], paddleDimensions[2]);
    model = mat4x4Mul(model, translateM4x4(gameState.p1Position[0], gameState.p1Position[1], gameState.p1Position[2]));

    if (mode == 0)
    {
        drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
            projection, view, model, classicPlayerColor, cubeBufferObject, glContext);
    }
    else{
        //TODO(yassine): player1Color query this form the database.
        drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
            projection, view, model, player1Color, cubeBufferObject, glContext);
    }

    //DRAW the P2

    model = scaleM4x4(paddleDimensions[0], paddleDimensions[1], paddleDimensions[2]);
    model = mat4x4Mul(model, translateM4x4(gameState.p2Position[0], gameState.p2Position[1], gameState.p2Position[2]));

    //TODO(yassine): player1Color query this form the database.
    if (mode == 0)
    {
        drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
            projection, view, model, classicPlayerColor, cubeBufferObject, glContext);
    }
    else{
        //TODO(yassine): player1Color query this form the database.
        drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
            projection, view, model, player2Color, cubeBufferObject, glContext);
    }

    if (mode == 1)
    {
        model = scaleM4x4(sideDimensions[0], sideDimensions[1], sideDimensions[2]);
        model = mat4x4Mul(model, translateM4x4(leftSidePosition[0], leftSidePosition[1], leftSidePosition[2]));

        drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
                projection, view, model, tableColor, cubeBufferObject, glContext);

        model = scaleM4x4(sideDimensions[0], sideDimensions[1], sideDimensions[2]);
        model = mat4x4Mul(model, translateM4x4(leftSidePosition[0], leftSidePosition[1], -leftSidePosition[2]));

        drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
                projection, view, model, tableColor, cubeBufferObject, glContext);

        model = scaleM4x4(baseTableDimensions[0], baseTableDimensions[1], baseTableDimensions[2] + (sideDimensions[2] / 2.0));
        model = mat4x4Mul(model, translateM4x4(baseTablePosition[0], baseTablePosition[1], baseTablePosition[2]));

        drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc,
            projection, view, model, tableColor, cubeBufferObject, glContext);

        for (let i = 0; i < 4; i++)
        {
            model = scaleM4x4(footDimension[0], footDimension[1], footDimension[2]);
            model = mat4x4Mul(model, translateM4x4(feetPositions[i][0], feetPositions[i][1], feetPositions[i][2]));
            drawCube(projectionLoc, viewLoc, modelLoc, objColorLoc, projection, view, model, tableColor, cubeBufferObject, glContext);
        }
    }

    //DRAW the BALL.

    model = scaleM4x4(ballDimensions[0], ballDimensions[1], ballDimensions[2]);
    model = mat4x4Mul(model, translateM4x4(gameState.ballPosition[0], gameState.ballPosition[1], gameState.ballPosition[2]));

    if (mode == 0)
    {
        drawSphere(projectionLoc, viewLoc, modelLoc, objColorLoc,
            projection, view, model, ballClassicColor, sphereBufferObject
            , glContext);    
    }
    else{
        //TODO(yassine): player1Color query this form the database.
        drawSphere(projectionLoc, viewLoc, modelLoc, objColorLoc,
            projection, view, model, ballColor, sphereBufferObject, glContext);
    
    }

    //window.requestAnimationFrame(render);
}

//adjustCanvas();
//main();
//render();
