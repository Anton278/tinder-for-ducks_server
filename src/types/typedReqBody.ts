export interface TypedReqBody<T> extends Express.Request {
  body: T;
}
