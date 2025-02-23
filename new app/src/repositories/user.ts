import constants from "../config/constants";
import utility from "../services/util";
import { logger } from "../logging";
import Mysql from "../database/mySqlConnection";
import PostgreSql from "../database/postgreSqlConnection";
import moment from "moment";

interface UserData {
    id?: number;
    name: string;
    email: string;
    password: string;
    status: number;
    type: string;
    password_valid_till?: string;
    last_updated_by: string;
    phone?: string;
    address?: string;
    poc?: string;
    uuid?: string;
}

export const userService = {
    insertUser: async (data: UserData): Promise<void> => {
        try {
            const query = `INSERT INTO ${constants.TABLES.USER} 
                (name, email, password, status, type, password_valid_till, last_updated_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                data.name, data.email, data.password, data.status,
                data.type, data.password_valid_till, data.last_updated_by
            ];

            const resp = await Mysql.query(query, params);
            if (resp.data.insertId) {
                await userService.insertUserHistory(resp.data.insertId);
            }
        } catch (e) {
            logger.error(`Error in insertUser: ${utility.generateError(e)}`);
            throw e;
        }
    },

    insertUserHistory: async (userId: number): Promise<void> => {
        try {
            const query = `INSERT INTO ${constants.TABLES.USER_HISTORY} 
                (user_id, name, phone, email, password, address, poc, status, last_updated_by, type) 
                SELECT id, name, phone, email, password, address, poc, status, last_updated_by, type 
                FROM ${constants.TABLES.USER} WHERE id = ?`;

            await PostgreSql.query(query, [userId]);
        } catch (e) {
            logger.error(`Error in insertUserHistory: ${utility.generateError(e)}`);
            throw e;
        }
    },

    update: async (data: UserData): Promise<void> => {
        try {
            const query = `UPDATE ${constants.TABLES.USER} 
                SET name = ?, phone = ?, address = ?, poc = ?, status = ?, last_updated_by = ?, type = ? 
                WHERE uuid = ?`;

            const params = [
                data.name, data.phone, data.address, data.poc, 
                data.status, data.last_updated_by, data.type, data.uuid
            ];

            const resp = await Mysql.query(query, params);
            if (resp.data.affectedRows > 0) {
                await userService.insertUserHistory(data.id as number);
            }
        } catch (e) {
            logger.error(`Error in updateUser: ${utility.generateError(e)}`);
            throw e;
        }
    },

    updateStatusAndPassword: async (status: number, password: string, userId: number, lastUpdatedBy: string, passwordValidTill: string): Promise<void> => {
        try {
            const query = `UPDATE ${constants.TABLES.USER} 
                SET status = ?, password = ?, password_valid_till = ?, last_updated_by = ? 
                WHERE id = ?`;

            const params = [status, password, passwordValidTill, lastUpdatedBy, userId];
            const resp = await Mysql.query(query, params);

            if (resp.data.affectedRows > 0) {
                await userService.insertUserHistory(userId);
            }
        } catch (e) {
            logger.error(`Error in updateStatusAndPassword: ${utility.generateError(e)}`);
            throw e;
        }
    },

    getUserByID: async (id: number): Promise<UserData | null> => {
        try {
            const query = `SELECT * FROM ${constants.TABLES.USER} WHERE id = ? AND status = ?`;
            const params = [id, constants.STATUS.USER.ACTIVE];

            const resp = await PostgreSql.query(query, params);
            return resp.data.length ? resp.data[0] : null;
        } catch (e) {
            logger.error(`Error in getUserByID: ${utility.generateError(e)}`);
            throw e;
        }
    },

    getUserByEmail: async (email: string): Promise<UserData | null> => {
        try {
            const query = `SELECT * FROM ${constants.TABLES.USER} WHERE email = ? ORDER BY id DESC LIMIT 1`;
            const params = [email];

            const resp = await PostgreSql.query(query, params);
            return resp.data.length ? resp.data[0] : null;
        } catch (e) {
            logger.error(`Error in getUserByEmail: ${utility.generateError(e)}`);
            throw e;
        }
    },

    search: async (text: string): Promise<UserData[] | null> => {
        try {
            const query = `SELECT * FROM ${constants.TABLES.USER} WHERE email LIKE ? ORDER BY id DESC`;
            const params = [`%${text}%`];

            const resp = await PostgreSql.query(query, params);
            return resp.data.length ? resp.data : null;
        } catch (e) {
            logger.error(`Error in search: ${utility.generateError(e)}`);
            throw e;
        }
    },

    updateAfterSuccessfulLogin: async (userId: number): Promise<void> => {
        const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
        const expiryTime = moment().add(30, "days").format("YYYY-MM-DD HH:mm:ss");

        try {
            const query = `UPDATE ${constants.TABLES.USER} 
                SET last_login_at = ?, password_valid_till = ? 
                WHERE id = ?`;

            const params = [currentTime, expiryTime, userId];
            const resp = await Mysql.query(query, params);

            if (resp.data.affectedRows > 0) {
                await userService.insertUserHistory(userId);
            }
        } catch (e) {
            logger.error(`Error in updateAfterSuccessfulLogin: ${utility.generateError(e)}`);
            throw e;
        }
    },

    getUsersByType: async (type: string): Promise<UserData[] | null> => {
        try {
            const query = `SELECT * FROM ${constants.TABLES.USER} 
                WHERE type = ? AND status = ? ORDER BY id DESC`;

            const params = [type, constants.STATUS.USER.ACTIVE];
            const resp = await PostgreSql.query(query, params);
            return resp.data.length ? resp.data : null;
        } catch (e) {
            logger.error(`Error in getUsersByType: ${utility.generateError(e)}`);
            throw e;
        }
    }
};
