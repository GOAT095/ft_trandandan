import {
  vector, point, vector_add, vector_mul_scalar, vector_div_scalar,
  vector_sub,
  vector_normal
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


  // Image
  const aspect_ratio = 16.0 / 9.0 ;
  const image_width = 1200;
  const image_height = image_width / aspect_ratio;

  canvas = document.createElement("canvas");
  canvas.width = image_width;
  canvas.height = image_height;

  // Camera
  const viewport_height = 2.0;
  const viewport_width = aspect_ratio * viewport_height;
  const focal_length = 1.0;

  const origin = point(0, 0, 0);
  const horizontal = vector(viewport_width, 0, 0);
  const vertical = vector(0, viewport_width, 0);
  const lower_left_corner = vector_sub(
    vector_sub(vector_sub(origin, vector_div_scalar(horizontal, 2)), vector_div_scalar(vertical, 2)),
    vector(0, 0, focal_length))


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
    const aspect_ratio = 16.0 / 9.0 ;
    const image_width = 1200;
    const image_height = image_width / aspect_ratio;

    canvas.width = image_width;
    canvas.height = image_height;


    // Camera
    const viewport_height = 2.0;
    const viewport_width = aspect_ratio * viewport_height;
    const focal_length = 1.0;

    const origin = point(0, 0, 0);
    const horizontal = vector(viewport_width, 0, 0);
    const vertical = vector(0, viewport_width, 0);
    const lower_left_corner = vector_sub(
      vector_sub(vector_sub(origin, vector_div_scalar(horizontal, 2)), vector_div_scalar(vertical, 2)),
      vector(0, 0, focal_length))


    const image = ctx.getImageData(0, 0, image_width, image_height);

    for (let i: number = 0; i < image_width; i++) {
      for (let j: number = 0; j < image_height; j++ ) {
        let u = i / (image_width - 1);
        let v = j / (image_height - 1);
        let r = new ray(origin,
          vector_add(
            vector_add(lower_left_corner, vector_mul_scalar(horizontal, u)),
            vector_sub(vector_mul_scalar(vertical, v), origin)
          )
        );

        let unit_direction = vector_normal(r.direction);
        let t = 0.5*(unit_direction.y + 1.0);
        let color = vector_add(vector_mul_scalar(vector(1.0, 1.0, 1.0), (1.0 - t)), vector_mul_scalar(vector(0.5, 0.7, 1.0), t));

        const offset = (j * image_width + i) * 4;
        image.data[offset    ] =  color.x * 255;
        image.data[offset + 1] =  color.y * 255;
        image.data[offset + 2] =  color.z * 255;
        image.data[offset + 3] = 255;

      }
      g_progress = ((image_width - i) / image_width) * 100
      console.log(`rendering: ${image_width - i} of ${image_width}`)
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