// import { Request, Response, NextFunction } from "express";
// import config from "../config";
// import jwt from "jsonwebtoken";

// const validateToken = async (
//   req: any,
//   res: any,
//   next: NextFunction
// ) => {
//   const headerToken = req.headers["authorization"];

//   if (headerToken !== undefined && headerToken?.startsWith("Bearer ")) {
//     const bearerToken = headerToken.slice(7);
//     try {
//       await jwt.verify(bearerToken, config.SECRET);
//       return next();
//     } catch (error) {
//       return res.status(400).json({ message: "Token Invalido" });
//     }
//   } else {
//     return res.status(401).json({ message: "Acceso denegado" });
//   }
// };

// export default validateToken;
