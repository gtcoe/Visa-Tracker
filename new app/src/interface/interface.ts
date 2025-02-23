import { JwtPayload } from "jsonwebtoken";

export interface User {
  username: { type: string; required: true };
  email: { type: string; required: true };
  password: String;
}

export interface Post {
  title: string;
  post: string;
  author: string | JwtPayload | null;
}
