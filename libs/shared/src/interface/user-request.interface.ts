// import { Request } from 'express';

export interface UserRequest {
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
