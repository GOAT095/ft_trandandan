import {
  vector, point, vector_add, vector_mul_scalar, vector_div_scalar,
  vector_sub,
  vector_normal,
  dot,
  cross,
  vector_equal,
  orthonormal,
  vector_magnitude
} from "./vector"

//interface error {
//    error : number ;
//}

type error = 0 | 1 ;

const ok  = 0;
const err = 1;

var g_progress = 0;

var canvas: HTMLCanvasElement ;

class ray {
  origin : vector = {x: 0, y: 0, z: 0, w: 0};
  direction: vector = {x: 0, y: 0, z: 0, w: 0};

  constructor(origin: vector, direction: vector) {
    this.origin = origin,
    this.direction = direction;
  }

  at(t: number) : vector {
    return vector_add(this.origin, vector_mul_scalar(this.direction, t));
  }
}

function hit_sphere(center: vector, radius: number, r: ray) : number {
  let oc = vector_sub(r.origin, center);
  let a = dot(r.direction, r.direction);
  let b = 2.0 * dot(oc, r.direction);
  let c = dot(oc, oc) - radius*radius;
  let delta = b*b - 4*a*c;

  let t0 = (-b - Math.sqrt(delta)) / (2.0*a);
  let t1 = (-b + Math.sqrt(delta)) / (2.0*a);

  let t = Math.min(t0, t1);

  if (delta > 0 && t > 0) {
    return t;
  }
  else {
    return -1.0;
  }
}

export function draw() : error {
  //const canvas: HTMLElement | null = document.getElementById('tutorial');
  //const canvas = new HTMLCanvasElement();
  const body_collection : HTMLCollectionOf<HTMLBodyElement> = document.getElementsByTagName("body");
  if (body_collection.length == 0) {
    return err;
  }
  const body : HTMLBodyElement | null = body_collection.item(0);
  if (body == null) { // should not be checked 
    return err;       // since, we already checked for body_collection.length first !
  }

  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext('2d')
  if (ctx == null)
    return err;


  // static splash screen

  const interval_id = setInterval(function () {
    console.log(`draw : ${g_progress}`)
    const ctx = canvas.getContext('2d');
    if (ctx == null)
      return err;
    // static splash screen
    ctx.fillStyle = 'green';
    ctx.font = "50px sans-serif"
    ctx.fillText(`Loading ... ${g_progress}`, 50, 50);
    ctx.fillRect(50, 70, 150, 10);
  }, 30);
    
  /*
 async (canvas: HTMLCanvasElement) => {
    console.log("render: ");

    const image_width: number = canvas.width;
    const image_height: number = canvas.height;
    
    for (let j: number = image_height; j >= 0; --j) {
      for (let i: number = 0; i < image_width; i++ ) {
        let r = i / (image_width - 1);
        let g = j / (image_height - 1);
        let b = 0.25;

      }
      g_progress = ((image_height - j) / image_height) * 100
      console.log(`rendering: ${image_height - j} of ${image_height}`)
    }
 };
 */

  async function render(canvas : HTMLCanvasElement, interval_id : NodeJS.Timer) {
    console.log("render: ");

    const ctx = canvas.getContext("2d");
    if (ctx == null)
      return err;

    // Image
    const image_width = 1080;
    const image_height = 720;
    const origin = vector(0, 0, 0);
    const w = vector_normal(vector(0, 0, 1));
    const fov = 90;
    const image_view_center = vector_add(origin, w);
    const aspect_ratio = image_height/image_width;
    const image_view_width = 2 * Math.tan((fov/2)*Math.PI/180.0);
    const image_view_height = image_view_width * aspect_ratio;
    // basis
    let t = vector(0, 1, 0);
    let u = cross(t, w);
    if (vector_equal(u, vector(0, 0, 0))) {
      t = orthonormal(w);
      u = cross(t, w);
    }
    let v = cross(w, u);

    const image_view_bottom_left_corner = vector_sub(
      vector_sub(image_view_center, vector_mul_scalar(u, (image_view_width/2))),
      vector_mul_scalar(v, (image_view_height/2))
    );

    canvas.width = image_width;
    canvas.height = image_height;

    const image = ctx.getImageData(0, 0, image_width, image_height);

    for (let i: number = 0; i < image_width; i++ ) {
      for (let j: number = 0 ; j < image_height; j++) {
        let ux = i / (image_width - 1);
        let vx = (image_height - j) / image_height;
        let r = new ray(origin,
          vector_normal(
            vector_sub(
              vector_add(
                vector_add(image_view_bottom_left_corner, vector_mul_scalar(u, ux * image_view_width)),
                vector_mul_scalar(v, vx * image_view_height)
              ),
              origin
            )
          )
        );

        let unit_direction = vector_normal(r.direction);
        let t = 0.5*(unit_direction.y + 1.0);
        let color = vector_add(vector_mul_scalar(vector(1.0, 1.0, 1.0), (1.0 - t)), vector_mul_scalar(vector(0.5, 0.7, 1.0), t));
        if ((t = hit_sphere(vector(0, 0, 5), 1, r)) > 0.0) {
          let N = vector_normal(vector_sub(r.at(t), vector(0, 0, 5)));
          //let N = vector_normal(vector_mul_scalar(vector_sub(r.at(t), vector(0, 0, 5)), 2.0));
          color = vector_mul_scalar(vector(N.x+1, N.y+1, N.z+1), 0.5);
          //color = N;
        }

        const offset = (j * image_width + i) * 4;
        image.data[offset    ] =  color.x * 255;
        image.data[offset + 1] =  color.y * 255;
        image.data[offset + 2] =  color.z * 255;
        image.data[offset + 3] = 255;

      }
      //g_progress = ((image_height - j) / image_height) * 100
      //console.log(`rendering: ${image_height - j} of ${image_height}`)
    }
    clearInterval(interval_id);
    ctx.putImageData(image, 0, 0);
  }

  render(canvas, interval_id);

  //canvas.toBlob((blob) => {
  //  blob?.text().then(
  //    (value: string) => {console.log(value)},);
  //}, 'image/bmp', 0.95)

  body.appendChild(canvas);
  return ok;
}

// TODO:
//  - add splash screen
//    ~ font size ? ctx.font = `css`
//  ~ progressivly update the canvas (frames) setInterval/clearInterval
//  - rendring to an image ? then to canvas ?
//    - possible apis:
//      - CanvasRenderingContext2D.putImageData()
//      - CanvasRenderingContext2D.drawImage()
//      - ImageBitmapRenderingContext.transferFromImageBitmap()