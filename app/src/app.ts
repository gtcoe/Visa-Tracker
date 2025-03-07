import express, {
  Express,
  Request,
  Response,
  NextFunction,
  Router,
} from "express";

const app: Express = express();

export { express, app, Request, Response, NextFunction, Router };
