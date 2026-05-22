export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export interface Result<T, E = Error> {
  isSuccess: boolean;
  isFailure: boolean;
  getValue(): T;
  getError(): E;
}

export class Success<T, E = Error> implements Result<T, E> {
  readonly isSuccess = true;
  readonly isFailure = false;
  constructor(private readonly value: T) {}
  getValue(): T { return this.value; }
  getError(): E { throw new Error('Cannot get error from success result'); }
}

export class Failure<T, E = Error> implements Result<T, E> {
  readonly isSuccess = false;
  readonly isFailure = true;
  constructor(private readonly error: E) {}
  getValue(): T { throw new Error('Cannot get value from failure result'); }
  getError(): E { return this.error; }
}
