export function toRadians(angle:number): number
{
    return (angle * Math.PI/ 180.0);
}

function addV3(left : [number, number, number] , right : [number, number, number]) : [number, number, number]
{
    return ([left[0] + right[0], left[1] + right[1], left[2] + right[2]]);
}

function subV3(left : [number, number, number], right : [number, number, number]) : [number, number, number]
{
    return ([left[0] - right[0], left[1] - right[1], left[2] - right[2]]);
}

function mulV3(left : [number, number, number], right : [number, number, number]) : [number, number, number]
{
    return ([left[0] * right[0], left[1] * right[1], left[2] * right[2]]);
}

function mulV3f(left : [number, number, number], right : number) : [number, number, number]
{
    return ([left[0] * right, left[1] * right, left[2] * right]);
}

function dotV3(left : [number, number, number], right : [number, number, number]) : number
{
    return ((left[0] * right[0]) + (left[1] * right[1]) + (left[2] * right[2]));
}

function crossV3(left : [number, number, number], right : [number, number, number]) : [number, number, number]
{
    return ([(left[1] * right[2]) - (left[2] * right[1]),
    (left[2] * right[0]) - (left[0] * right[2]),
    (left[0] * right[1]) - (left[1] * right[0])
    ]);
}

function lenV3(vec : [number, number, number]) : number
{
    return (Math.sqrt(dotV3(vec, vec)));
}

function normalizeV3(vec : [number, number, number]) : [number, number, number]
{
    const len = lenV3(vec);
    return ([vec[0] / len, vec[1] / len, vec[2] / len]);
}

export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];
export type vec4x4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
];

export function mat4x4Add(left: vec4x4, right: vec4x4): vec4x4
{
    const result: vec4x4 = [
        left[0] + right[0], left[1] + right[1], left[2] + right[2], left[3] + right[3],
        left[4] + right[4], left[5] + right[5], left[6] + right[6], left[7] + right[7],
        left[8] + right[8], left[9] + right[9], left[10] + right[10], left[11] + right[11],
        left[12] + right[12], left[13] + right[13], left[14] + right[14], left[15] + right[15]
    ];
    return (result);
}

export function mat4x4Sub(left: vec4x4, right: vec4x4): vec4x4
{
    const result: vec4x4 = [
        left[0] - right[0], left[1] - right[1], left[2] - right[2], left[3] - right[3],
        left[4] - right[4], left[5] - right[5], left[6] - right[6], left[7] - right[7],
        left[8] - right[8], left[9] - right[9], left[10] - right[10], left[11] - right[11],
        left[12] - right[12], left[13] - right[13], left[14] - right[14], left[15] - right[15]
    ];
    return (result);
}

export function mat4x4V4Mul(left: vec4x4, right:vec4x4): vec4
{
    let result:vec4 = [0.0, 0.0, 0.0, 0.0];

    result[0] = left[0] * right[0]
                + left[1] * right[1]
                + left[2] * right[2]
                + left[3] * right[3];
    result[1] = left[4] * right[0]
                + left[5] * right[1]
                + left[6] * right[2]
                + left[7] * right[3];
    result[2] = left[8] * right[0]
                + left[9] * right[1]
                + left[10] * right[2]
                + left[11] * right[3];
    result[3] = left[12] * right[0]
                + left[13] * right[1]
                + left[14] * right[2]
                + left[15] * right[3];
    return (result);
}

export function v4Mat4x4Mul(left: vec4x4, right: vec4x4):vec4
{
    let result:vec4 = [0.0, 0.0, 0.0, 0.0];

    result[0] = left[0] * right[0]
                + left[1] * right[4]
                + left[2] * right[8]
                + left[3] * right[12];
    result[1] = left[0] * right[1]
                + left[1] * right[5]
                + left[2] * right[9]
                + left[3] * right[13];
    result[2] = left[0] * right[2]
                + left[1] * right[6]
                + left[2] * right[10]
                + left[3] * right[14];
    result[3] = left[0] * right[3]
                + left[1] * right[7]
                + left[2] * right[11]
                + left[3] * right[15];
    return (result);
}

export function mat4x4Mul(left: vec4x4, right: vec4x4): vec4x4
{
    let result = mat4x4Identity();
    
    result[0] = left[0] * right[0]
                    + left[1] * right[4]
                    + left[2] * right[8]
                    + left[3] * right[12];
    result[1] = left[0] * right[1]
                    + left[1] * right[5]
                    + left[2] * right[9]
                    + left[3] * right[13];
    result[2] = left[0] * right[2]
                + left[1] * right[6]
                + left[2] * right[12]
                + left[3] * right[14];
    result[3] = left[0] * right[3]
                + left[1] * right[7]
                + left[2] * right[11]
                + left[3] * right[15];

    result[4] = left[4] * right[0]
                + left[5] * right[4]
                + left[6] * right[8]
                + left[7] * right[12];
    result[5] = left[4] * right[1]
                + left[5] * right[5]
                + left[6] * right[9]
                + left[7] * right[13];
    result[6] = left[4] * right[2]
                + left[5] * right[6]
                + left[6] * right[10]
                + left[7] * right[14];
    result[7] = left[4] * right[3]
                + left[5] * right[7]
                + left[6] * right[11]
                + left[7] * right[15];
    
    result[8] = left[8] * right[0]
                + left[9] * right[4]
                + left[10] * right[8]
                + left[11] * right[12];
    result[9] = left[8] * right[1]
                + left[9] * right[5]
                + left[10] * right[9]
                + left[11] * right[13];
    result[10] = left[8] * right[2]
                + left[9] * right[6]
                + left[10] * right[10]
                + left[11] * right[14];
    result[11] = left[8] * right[3]
                + left[9] * right[7]
                + left[10] * right[11]
                + left[11] * right[15];

    result[12] = left[12] * right[0]
                + left[13] * right[4]
                + left[14] * right[8]
                + left[15] * right[12];
    result[13] = left[12] * right[1]
                + left[13] * right[5]
                + left[14] * right[9]
                + left[15] * right[13];
    result[14] = left[12] * right[2]
                + left[13] * right[6]
                + left[14] * right[10]
                + left[15] * right[14];
    result[15] = left[12] * right[3]
                + left[13] * right[7]
                + left[14] * right[11]
                + left[15] * right[15];
    return (result);
}

export function    mat4x4Identity(): vec4x4
{
    return ([
         1.0, 0.0, 0.0, 0.0,
         0.0, 1.0, 0.0, 0.0,
         0.0, 0.0, 1.0, 0.0,
         0.0, 0.0, 0.0, 1.0
    ]);
}

export function scaleM4x4(x: number, y: number, z: number):vec4x4
{
    return ([
         x, 0.0, 0.0, 0.0,
         0.0, y, 0.0, 0.0,
         0.0, 0.0, z, 0.0,
         0.0, 0.0, 0.0, 1.0,
    ]);
}

export function scaleM4x4XAxis(value: number):vec4x4
{
    return ([
         value, 0.0, 0.0, 0.0,
         0.0, 1.0, 0.0, 0.0,
         0.0, 0.0, 1.0, 0.0,
         0.0, 0.0, 0.0, 1.0,
    ]);
}

export function scaleM4x4YAxis(value: number):vec4x4
{
    return ([
         1.0, 0.0, 0.0, 0.0,
         0.0, value, 0.0, 0.0,
         0.0, 0.0, 1.0, 0.0,
         0.0, 0.0, 0.0, 1.0,
    ]);
}

export function scaleM4x4ZAxis(value: number):vec4x4
{
    return ([
         1.0, 0.0, 0.0, 0.0,
         0.0, 1.0, 0.0, 0.0,
         0.0, 0.0, value, 0.0,
         0.0, 0.0, 0.0, 1.0,
    ]);
}

export function translateM4x4(x: number, y: number, z: number):vec4x4
{
    return ([
         1.0, 0.0, 0.0, 0.0,
         0.0, 1.0, 0.0, 0.0,
         0.0, 0.0, 1.0, 0.0,
         x, y, z, 1.0,
    ]);
}

export function rotM4x4XAxis(angle: number):vec4x4
{
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return ([1.0, 0.0, 0.0, 0.0,
             0.0, c, s, 0.0,
             0.0, -s, c, 0.0,
             0.0, 0.0, 0.0, 1.0
            ]);
}

export function rotM4x4YAxis(angle: number):vec4x4
{
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return ([c, 0.0, -s, 0.0,
             0.0, 1.0, 0.0, 0.0,
             s, 0.0, c, 0.0,
             0.0, 0.0, 0.0, 1.0
            ]);
}

export function rotM4x4ZAxis(angle: number):vec4x4
{
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return ([c, s, 0.0, 0.0,
             -s, c, 0.0, 0.0,
             0.0, 0.0, 1.0, 0.0,
             0.0, 0.0, 0.0, 1.0
            ]);
}

export function rotM4x4ArbitraryAxis(axis: vec3, angle: number):vec4x4
{
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    const x = axis[0];
    const y = axis[1];
    const z = axis[2];

    return ([c + ((1 - c) * x * x),
              ((1 - c) * x * y) + (s * z),
              ((1 - c) * x * z) - (s * y),
              0.0,
             ((1 - c) * x * y) - (s * z),
              c + ((1 - c) * y * y),
              ((1 - c) * y * z) + (s * x),
              0.0,
             ((1 - c) * x * z) + (s * y),
              ((1 - c) * y * z) - (s * x),
              c + ((1 - c) * z * z),
              0.0,
             0.0, 0.0, 0.0, 1.0
            ]);    
}

export function    lookAtLH(eye: vec3, at: vec3, up: vec3): vec4x4
{
    const zAxis = normalizeV3(subV3(at, eye));
    const xAxis = normalizeV3(crossV3(up, zAxis));
    const yAxis = crossV3(zAxis, xAxis);

    let result:vec4x4 = [
        xAxis[0], yAxis[0], zAxis[0], 0.0,
        xAxis[1], yAxis[1], zAxis[1], 0.0,
        xAxis[2], yAxis[2], zAxis[2], 0.0,
        -dotV3(xAxis, eye), -dotV3(yAxis, eye), -dotV3(zAxis, eye), 1.0,
    ];
    return (result);
}

export function    perspectiveLH(fov: number, aspect: number, near: number, far: number):vec4x4
{
    const tan = Math.tan(fov / 2.0);
    return ([
        1.0 / (tan * aspect), 0.0, 0.0, 0.0,
        0.0, 1.0 / tan, 0.0, 0.0,
        0.0, 0.0, far / (far - near), 1.0,
        0.0, 0.0, -(near * far) / (far * near), 0.0
    ]);
}