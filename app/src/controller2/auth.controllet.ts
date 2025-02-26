import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import connect from "../database";
import { RowDataPacket } from "mysql2";
import { User } from "../interface/interface";
import bcrypt from "bcryptjs";
import config from "../config";

export async function signup(req: any, res: any) {
  try {
    const { body } = req;
    const conn = await connect();

    const [t] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM user WHERE username = ? ",
      [body.username]
    );
    console.log(t.length);
    //Verificar username y email
    if (t.length > 0) {
      return res.status(200).json({ message: "Username o email ya en uso" });
    }

    //Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    console.log(salt);
    const encryptedPassword = await bcrypt.hash(body.password, salt);
    console.log(encryptedPassword);

    const newUser: User = {
      username: body.username,
      email: body.email,
      password: encryptedPassword,
    };

    //Query
    await conn
      .query("INSERT INTO user SET ?", [newUser])
      .then((_data) =>
        res
          .status(201)
          .json({ message: "User created successfully"})
      )
      .catch((err) => res.json({ error: err.message }));
  } catch (error) {
    return res.status(400).json(error);
  }
}

export async function login(req: any, res: any) {
  const { body } = req;
  const conn = await connect();

  const [t] = await conn.query<RowDataPacket[]>(
    "SELECT * FROM user WHERE username = ?",
    [body.username]
  );

  if (t.length == 0 || t == undefined) {
    return res.status(200).json({ message: "Usuario no encontrado" });
  } else {
    const encryptedPassword: string = t[0].password;
    const vToken = await bcrypt.compare(body.password, encryptedPassword);
    if (vToken == false) {
      return res.status(400).json({ message: "Contraseña Incorrecta" });
    } else {
      const token = await jwt.sign({ user_id: t[0].user_id }, config.SECRET);
      return res.status(200).json({ token: token });
    }
  }
}
