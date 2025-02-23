import constants from "../config/constants";
import utility from "../../../visa/app/services/util";
import { logger } from "../logging";
import Mysql from "../database/mySqlConnection";
import PostgreSql from "../database/postgreSqlConnection";
import moment from "moment";

interface ApplicationData {
    id?: number;
    name: string;
    phone: string;
    email: string;
    password: string;
    address: string;
    poc: string;
    last_updated_by: string;
    type: string;
    status?: number;
    uuid?: string;
}

export const applicationService = {
    create: async (data: ApplicationData): Promise<void> => {
        try {
            const query = `INSERT INTO ${constants.TABLES.APPLICATION} 
                (name, phone, email, password, address, poc, status, last_updated_by, type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const params = [
                data.name, data.phone, data.email, data.password, 
                data.address, data.poc, constants.STATUS.APPLICATION.ACTIVE, 
                data.last_updated_by, data.type
            ];

            const resp = await Mysql.query(query, params);
            if (resp.data.insertId) {
                await applicationService.insertHistory(resp.data.insertId);
            }
        } catch (e) {
            logger.error(`Error in createApplication: ${utility.generateError(e)}`);
            throw e;
        }
    },

    insertHistory: async (id: number): Promise<void> => {
        try {
            const query = `INSERT INTO ${constants.TABLES.APPLICATION_HISTORY} 
                (application_id, name, phone, email, password, address, poc, status, last_updated_by, type) 
                SELECT id, name, phone, email, password, address, poc, status, last_updated_by, type 
                FROM ${constants.TABLES.APPLICATION} WHERE id = ?`;

            await PostgreSql.query(query, [id]);
        } catch (e) {
            logger.error(`Error in insertApplicationHistory: ${utility.generateError(e)}`);
            throw e;
        }
    },

    addDetails: async (data: ApplicationData): Promise<void> => {
        try {
            const query = `UPDATE ${constants.TABLES.APPLICATION} 
                SET name = ?, phone = ?, address = ?, poc = ?, status = ?, last_updated_by = ?, type = ? 
                WHERE uuid = ?`;

            const params = [
                data.name, data.phone, data.address, data.poc, 
                data.status, data.last_updated_by, data.type, data.uuid
            ];

            const resp = await Mysql.query(query, params);
            if (resp.data.affectedRows > 0) {
                await applicationService.insertHistory(data.id as number);
            }
        } catch (e) {
            logger.error(`Error in addDetails: ${utility.generateError(e)}`);
            throw e;
        }
    },

    getApplicationByID: async (id: number): Promise<ApplicationData | null> => {
        try {
            const query = `SELECT * FROM ${constants.TABLES.APPLICATION} 
                WHERE id = ? AND status = ?`;
            
            const params = [id, constants.STATUS.APPLICATION.ACTIVE ];
            const resp = await PostgreSql.query(query, params);

            return resp.data.length ? resp.data[0] : null;
        } catch (e) {
            logger.error(`getApplicationByID error: ${utility.generateError(e)}`);
            throw e;
        }
    },

    search: async (text: string): Promise<ApplicationData[] | null> => {
        try {
            const query = `SELECT * FROM ${constants.TABLES.APPLICATION} 
                WHERE email LIKE ? ORDER BY id DESC`;
            
            const params = [`%${text}%`];
            const resp = await PostgreSql.query(query, params);

            return resp.data.length ? resp.data : null;
        } catch (e) {
            logger.error(`search error: ${utility.generateError(e)}`);
            throw e;
        }
    },

    updateDocuments: async (applicationId: number): Promise<void> => {
        try {
            const query = `UPDATE ${constants.TABLES.APPLICATION} 
                SET last_login_at = ? WHERE id = ?`;

            const params = [moment().format("YYYY-MM-DD HH:mm:ss"), applicationId];
            const resp = await Mysql.query(query, params);

            if (resp.data.affectedRows > 0) {
                await applicationService.insertHistory(applicationId);
            }
        } catch (e) {
            logger.error(`Error in updateDocuments: ${utility.generateError(e)}`);
            throw e;
        }
    },

    updateApplicationStatus: async (applicationId: number): Promise<void> => {
        try {
            const query = `UPDATE ${constants.TABLES.APPLICATION} 
                SET last_login_at = ? WHERE id = ?`;

            const params = [moment().format("YYYY-MM-DD HH:mm:ss"), applicationId];
            const resp = await Mysql.query(query, params);

            if (resp.data.affectedRows > 0) {
                await applicationService.insertHistory(applicationId);
            }
        } catch (e) {
            logger.error(`Error in updateApplicationStatus: ${utility.generateError(e)}`);
            throw e;
        }
    }
};
