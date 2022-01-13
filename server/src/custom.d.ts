declare namespace Express {
  export interface Request {
    session: Express.Session;
  }
  export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
}
