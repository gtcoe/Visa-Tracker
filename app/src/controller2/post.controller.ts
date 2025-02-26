import { Request, Response } from "express";
import { Post } from "../interface/interface";
import connect from "../database";
import { RowDataPacket } from "mysql2";
import jwt, { JwtPayload } from "jsonwebtoken";

declare module jsonwebtoken {
  export interface JwtPayload {
    user_id: string;
  }
}

export async function createPost(req: any, res: any) {
  try {
    const { body } = req;
    const conn = await connect();
    const headerToken = req.headers["authorization"];
    if (headerToken) {
      const bearerToken = headerToken?.slice(7);
      const tokenData = (await jwt.decode(bearerToken)) as JwtPayload;
      const author = await conn.query<RowDataPacket[]>(
        "SELECT username FROM user WHERE user_id = ?",
        [tokenData?.user_id]
      );
      //VERIFICAR SI EXISTE EL TITULO
      const [exist] = await conn.query<RowDataPacket[]>(
        "SELECT * FROM post WHERE title = ?",
        [body.title]
      );
      if (exist.length > 0) {
        return res.status(200).json({ message: "Title already exist" });
      }
      const post: Post = {
        title: body.title,
        post: body.post,
        author: author[0][0].username,
      };
      // CREAR POST
      await conn.query("INSERT INTO post SET ?", [post]);
      res
        .status(201)
        .json({ message: "Post created successfully", post: post });
    }
  } catch (error: any) {
    return res.status(400).json(error.message);
  }
}

export async function getPost(req: any, res: any) {
  try {
    const { id } = req.params;
    const conn = await connect();
    const post = await conn.query<RowDataPacket[]>(
      "SELECT * FROM post WHERE post_id = ?",
      [id]
    );

    if (post[0].length == 0) {
      return res
        .status(204)
        .json({ message: `Post id_ ${id} no existe en nuestra Base de Datos` });
    }

    return res.status(200).json(post[0]);
  } catch (err: any) {
    return res.status(400).json(err.message);
  }
}

export async function getPosts(_req: any, res: any) {
  try {
    const conn = await connect();
    const [posts] = await conn.query<RowDataPacket[]>("SELECT * FROM post");

    if (posts[0].length == 0) {
      return res.json("Sin datos");
    } else {
      return res.status(200).json(posts[0]);
    }
  } catch (error: any) {
    return res.status(400).json(error.message);
  }
}

export async function updatePost(req: any, res: any) {
  try {
    const { id } = req.params;
    const { body } = req;
    const conn = await connect();
    const post = await conn.query<RowDataPacket[]>(
      "SELECT * FROM post WHERE post_id = ?",
      [id]
    );
    if (post[0].length == 0) {
      return res.status(204).json({ message: "Post Not Found" });
    }
    await conn.query("UPDATE post SET ? WHERE post_id = ? ", [body, id]);
    return res
      .status(200)
      .json({ message: `Post id: ${id} updated successfully` });
  } catch (error: any) {
    return res.status(400).json(error.message);
  }
}

export async function deletePost(req: any, res: any) {
  try {
    const { id } = req.params;
    const conn = await connect();
    const post = await conn.query<RowDataPacket[]>(
      "SELECT * FROM post WHERE post_id = ?",
      [id]
    );
    if (post[0].length == 0) {
      return res.status(204).json({ message: "Post Not Found" });
    }
    await conn.query("DELETE FROM post WHERE post_id = ? ", [id]);
    return res
      .status(200)
      .json({ message: `Post id: ${id} deleted successfully` });
  } catch (error: any) {
    return res.status(400).json(error.message);
  }
}
