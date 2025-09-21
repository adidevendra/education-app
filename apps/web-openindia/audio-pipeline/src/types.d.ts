declare module 'express-serve-static-core' {
  interface Request {
    // allow any for now
    [key: string]: any;
  }
}
