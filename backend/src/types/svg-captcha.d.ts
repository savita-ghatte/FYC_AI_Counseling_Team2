declare module 'svg-captcha' {
  interface CaptchaOptions {
    size?: number;
    ignoreChars?: string;
    noise?: number;
    color?: boolean;
    background?: string;
    width?: number;
    height?: number;
    fontSize?: number;
    charPreset?: string;
  }
  
  interface CaptchaObj {
    text: string;
    data: string;
  }

  export function create(options?: CaptchaOptions): CaptchaObj;
  export function createMathExpr(options?: CaptchaOptions): CaptchaObj;
}
