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

const ballRadius:number = 5.0;
const fieldDimensions:vec3 = [512.0, 0.1, 256.0];

export class GameState
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



// const ESC_BUTTON = ;

//window.addEventListener('resize', adjustCanvas, true);
//window.addEventListener('keydown', keyPress, false);
//window.addEventListener('keyup', keyUp, false);





export function createBufferObject(vertices: Float32Array, glContext: WebGL2RenderingContext)
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

export function bindBufferObject(bufferObject: WebGLBuffer, glContext: WebGL2RenderingContext)
{
    glContext.bindBuffer(glContext.ARRAY_BUFFER, bufferObject);
    glContext.vertexAttribPointer(0, 3, glContext.FLOAT, false, 6 * 4, 0);
    glContext.vertexAttribPointer(1, 3, glContext.FLOAT, false, 6 * 4, 3 * 4);
    glContext.enableVertexAttribArray(0);
    glContext.enableVertexAttribArray(1);
}

export function drawCube(
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

export function drawSphere(
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







//adjustCanvas();
//main();
//render();
