// import express, {
//   Express,
//   Request,
//   Response,
//   NextFunction,
//   Router,
// } from "express";

import express from "express";
import type {  Express,
    Request,
    Response,
    NextFunction,
    Router, } from "express"; // Use 'type' for TS compatibility


const app: Express = express();

export { express, app, Request, Response, NextFunction, Router };
