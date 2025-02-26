import constants from "../config/constants";
import { generateError } from "../services/util";
import { logger } from "../logging";
import Mysql from "../database/mySql";
import moment from "moment";

export interface UserData {
  id: number;
  name: string;
  email: string;
  password: string;
  status: number;
  type: number;
  password_valid_till: string;
  password_requested: number;
  last_updated_by: number;
}

const authRepository = () => {
  const insertUser = async (data: UserData): Promise<void> => {
    try {
      const query = `INSERT INTO ${constants.TABLES.USER} 
                (name, email, password, status, type, password_valid_till, last_updated_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const params = [
        data.name,
        data.email,
        data.password,
        data.status,
        data.type,
        data.password_valid_till,
        data.last_updated_by,
      ];
      const resp = await Mysql.query(query, params);
      if (resp.data.insertId) {
        await insertUserHistory(resp.data.insertId);
      }
    } catch (e) {
      logger.error(`Error in insertUser: ${generateError(e)}`);
      throw e;
    }
  };

  const insertUserHistory = async (userId: number | undefined): Promise<void> => {
    try {
      const query = `INSERT INTO ${constants.TABLES.USER_HISTORY} 
                (user_id, name, email, password, status, last_updated_by, type, password_valid_till, last_signed_in_at, password_requested) 
                SELECT id, name, email, password, status, last_updated_by, type, password_valid_till, last_signed_in_at, password_requested 
                FROM ${constants.TABLES.USER} WHERE id = ?`;
      await Mysql.query(query, [userId]);
    } catch (e) {
      logger.error(`Error in insertUserHistory: ${generateError(e)}`);
      throw e;
    }
  };

  const updateStatusAndPassword = async (
    status: number,
    password: string,
    userId: number,
    lastUpdatedBy: number,
    passwordValidTill: string
  ): Promise<void> => {
    try {
      const query = `UPDATE ${constants.TABLES.USER} 
                SET status = ?, password = ?, password_valid_till = ?, last_updated_by = ? 
                WHERE id = ?`;
      const params = [status, password, passwordValidTill, lastUpdatedBy, userId];
      const resp = await Mysql.query(query, params);
      if (resp.data.affectedRows > 0) {
        await insertUserHistory(userId);
      }
    } catch (e) {
      logger.error(`Error in updateStatusAndPassword: ${generateError(e)}`);
      throw e;
    }
  };

  const getUserByID = async (id: number): Promise<UserData | null> => {
    try {
      const query = `SELECT * FROM ${constants.TABLES.USER} WHERE id = ? AND status = ?`;
      const params = [id, constants.STATUS.USER.ACTIVE];
      const resp = await Mysql.query(query, params);
      return resp.data.length ? resp.data[0] : null;
    } catch (e) {
      logger.error(`Error in getUserByID: ${generateError(e)}`);
      throw e;
    }
  };

  const getUserByEmail = async (email: string): Promise<UserData | null> => {
    try {
      const query = `SELECT * FROM ${constants.TABLES.USER} WHERE email = ? ORDER BY id DESC LIMIT 1`;
      const params = [email];
      const resp = await Mysql.query(query, params);
      return resp.data.length ? resp.data[0] : null;
    } catch (e) {
      logger.error(`Error in getUserByEmail: ${generateError(e)}`);
      throw e;
    }
  };

  const search = async (text: string): Promise<UserData[] | null> => {
    try {
      const query = `SELECT * FROM ${constants.TABLES.USER} WHERE email LIKE ? ORDER BY id DESC`;
      const params = [`%${text}%`];
      const resp = await Mysql.query(query, params);
      return resp.data.length ? resp.data : null;
    } catch (e) {
      logger.error(`Error in search: ${generateError(e)}`);
      throw e;
    }
  };

  const updateAfterSuccessfulLogin = async (userId: number | undefined): Promise<void> => {
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const expiryTime = moment().add(30, "days").format("YYYY-MM-DD HH:mm:ss");
    try {
      const query = `UPDATE ${constants.TABLES.USER} 
                SET last_login_at = ?, password_valid_till = ? 
                WHERE id = ?`;
      const params = [currentTime, expiryTime, userId];
      const resp = await Mysql.query(query, params);
      if (resp.data.affectedRows > 0) {
        await insertUserHistory(userId);
      }
    } catch (e) {
      logger.error(`Error in updateAfterSuccessfulLogin: ${generateError(e)}`);
      throw e;
    }
  };

  const getUsersByType = async (type: string): Promise<UserData[] | null> => {
    try {
      const query = `SELECT * FROM ${constants.TABLES.USER} 
                WHERE type = ? AND status = ? ORDER BY id DESC`;
      const params = [type, constants.STATUS.USER.ACTIVE];
      const resp = await Mysql.query(query, params);
      return resp.data.length ? resp.data : null;
    } catch (e) {
      logger.error(`Error in getUsersByType: ${generateError(e)}`);
      throw e;
    }
  };

  return {
    insertUser,
    insertUserHistory,
    updateStatusAndPassword,
    getUserByID,
    getUserByEmail,
    search,
    updateAfterSuccessfulLogin,
    getUsersByType,
  };
};

export default authRepository;
