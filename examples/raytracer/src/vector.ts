export interface vector {
    x : number,
    y : number,
    z : number,
    w : number
}

export function n_equal(x : number, y : number) : boolean {
    return (x - y) < 1e-6 ;
}

export function vector_equal(x: vector, y : vector) : boolean {
    return (
        n_equal(x.x, y.x) && n_equal(x.y, y.y) &&
        n_equal(x.z, y.z) && n_equal(x.w, y.w)
    );
}

export function vector_add(x: vector, y : vector) : vector {
    let v : vector = {
        x: x.x + y.x,
        y: x.y + y.y,
        z: x.z + y.z,
        w: x.w + y.w,
    };
    return v;
}

export function vector_sub(x: vector, y: vector) : vector {
    return {
        x: x.x - y.x,
        y: x.y - y.y,
        z: x.z - y.z,
        w: x.w - y.w
    }
}

export function is_point(v: vector) : boolean {
    return (n_equal(v.w, 1));
}

export function is_vector(v: vector) : boolean {
    return (n_equal(v.w, 0));
}

export function point(x: number, y: number, z: number) : vector {
    return {x: x,  y: y, z: z, w: 1};
}

export function vector(x: number, y: number, z: number) : vector {
    return {x: x, y: y, z : z, w: 0};
}

export function vector_mul(x: vector, y: vector) : vector {
    return {
        x: x.x * y.x,
        y: x.y * y.y,
        z: x.z * y.z,
        w: x.w * y.w
    }
}

export function vector_neg(x: vector) : vector {
    return vector_sub(vector(0, 0, 0), x)
}

export function vector_mul_scalar(x: vector, scalar: number) : vector {
    return {
        x: x.x * scalar,
        y: x.y * scalar,
        z: x.z * scalar,
        w: x.w * scalar
    }
}

export function vector_div_scalar(x: vector, scalar: number) : vector {
    return {
        x: x.x / scalar,
        y: x.y / scalar,
        z: x.z / scalar,
        w: x.w / scalar
    }
}

export function vector_magnitude(x: vector) : number {
    return Math.sqrt(
        x.x * x.x +
        x.y * x.y +
        x.z * x.z
        )
}

export function vector_normal(x: vector) : vector {
    let mag : number = vector_magnitude(x);
    return vector(
        x.x / mag,
        x.y / mag,
        x.z / mag
    );
}

export function vector_cross_product(x: vector, y: vector) : vector {
    return vector(
        x.y * y.z - x.z * y.y,
        x.z * y.x - x.x * y.z,
        x.x * y.y - x.y * y.x
    );
}

export function cross(x: vector, y: vector) : vector {
    return vector(
        x.y * y.z - x.z * y.y,
        - (x.x * y.z - x.z * y.x),
        x.x * y.y - x.y * y.x
    )
}

export function magnitude(x: vector) : number {
    return vector_magnitude(x);
}

export function normal(x: vector) : vector {
    return vector_normal(x);
}

export function equal(x: vector, y: vector) : boolean {
    return vector_equal(x, y);
}

export function dot(x: vector, y: vector) : number {
    return (x.x * y.x + x.y * y.y + x.z * y.z);
}

export function orthonormal(v: vector) {
   const x = Math.abs(v.x);
   const y = Math.abs(v.y);
   const z = Math.abs(v.z);
   if (x <= y && y <= z) {
    return vector(1, y, z);
   }
   if (y <= x && x <= z) {
    return vector(x, 1, z);
   }
   return vector(x, y, 1);
}