import constants from "../config/constants";
import {generateError} from "../services/util";
import { logger } from "../logging";
import Mysql from "../database/mySql";
// import Mysql from "../database/postgreSqlConnection";
import moment from "moment";

export interface ApplicationData {
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

/**
 * Creates a new application and inserts a history record if an ID is returned.
 */
export const createApplication = async (data: ApplicationData): Promise<void> => {
  try {
    const query = `INSERT INTO ${constants.TABLES.APPLICATION} 
                (name, phone, email, password, address, poc, status, last_updated_by, type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    // TODO: Replace status below if needed.
    const params = [
      data.name,
      data.phone,
      data.email,
      data.password,
      data.address,
      data.poc,
      1,
      data.last_updated_by,
      data.type,
    ];

    const resp = await Mysql.query(query, params);
    if (resp.data.insertId) {
      await insertApplicationHistory(resp.data.insertId);
    }
  } catch (e) {
    logger.error(`Error in createApplication: ${generateError(e)}`);
    throw e;
  }
};

/**
 * Inserts an application history record.
 */
export const insertApplicationHistory = async (id: number): Promise<void> => {
  try {
    const query = `INSERT INTO ${constants.TABLES.APPLICATION_HISTORY} 
                (application_id, name, phone, email, password, address, poc, status, last_updated_by, type) 
                SELECT id, name, phone, email, password, address, poc, status, last_updated_by, type 
                FROM ${constants.TABLES.APPLICATION} WHERE id = ?`;
    await Mysql.query(query, [id]);
  } catch (e) {
    logger.error(`Error in insertApplicationHistory: ${generateError(e)}`);
    throw e;
  }
};

/**
 * Updates application details based on the provided UUID.
 */
export const addApplicationDetails = async (data: ApplicationData): Promise<void> => {
  try {
    const query = `UPDATE ${constants.TABLES.APPLICATION} 
                SET name = ?, phone = ?, address = ?, poc = ?, status = ?, last_updated_by = ?, type = ? 
                WHERE uuid = ?`;
    const params = [
      data.name,
      data.phone,
      data.address,
      data.poc,
      data.status,
      data.last_updated_by,
      data.type,
      data.uuid,
    ];
    const resp = await Mysql.query(query, params);
    if (resp.data.affectedRows > 0 && data.id) {
      await insertApplicationHistory(data.id);
    }
  } catch (e) {
    logger.error(`Error in addApplicationDetails: ${generateError(e)}`);
    throw e;
  }
};

/**
 * Retrieves an application by its ID if its status matches.
 */
export const getApplicationByID = async (id: number): Promise<ApplicationData | null> => {
  try {
    const query = `SELECT * FROM ${constants.TABLES.APPLICATION} 
                WHERE id = ? AND status = ?`;
    // TODO: Replace status below if needed.
    const params = [id, 1];
    const resp = await Mysql.query(query, params);
    return resp.data.length ? resp.data[0] : null;
  } catch (e) {
    logger.error(`getApplicationByID error: ${generateError(e)}`);
    throw e;
  }
};

/**
 * Searches applications by email.
 */
export const searchApplications = async (text: string): Promise<ApplicationData[] | null> => {
  try {
    const query = `SELECT * FROM ${constants.TABLES.APPLICATION} 
                WHERE email LIKE ? ORDER BY id DESC`;
    const params = [`%${text}%`];
    const resp = await Mysql.query(query, params);
    return resp.data.length ? resp.data : null;
  } catch (e) {
    logger.error(`search error: ${generateError(e)}`);
    throw e;
  }
};

/**
 * Updates the last login time for an application and inserts a history record.
 */
export const updateApplicationDocuments = async (applicationId: number): Promise<void> => {
  try {
    const query = `UPDATE ${constants.TABLES.APPLICATION} 
                SET last_login_at = ? WHERE id = ?`;
    const params = [moment().format("YYYY-MM-DD HH:mm:ss"), applicationId];
    const resp = await Mysql.query(query, params);
    if (resp.data.affectedRows > 0) {
      await insertApplicationHistory(applicationId);
    }
  } catch (e) {
    logger.error(`Error in updateApplicationDocuments: ${generateError(e)}`);
    throw e;
  }
};

/**
 * Updates the application status by updating the last login time and inserting a history record.
 */
export const updateApplicationStatus = async (applicationId: number): Promise<void> => {
  try {
    const query = `UPDATE ${constants.TABLES.APPLICATION} 
                SET last_login_at = ? WHERE id = ?`;
    const params = [moment().format("YYYY-MM-DD HH:mm:ss"), applicationId];
    const resp = await Mysql.query(query, params);
    if (resp.data.affectedRows > 0) {
      await insertApplicationHistory(applicationId);
    }
  } catch (e) {
    logger.error(`Error in updateApplicationStatus: ${generateError(e)}`);
    throw e;
  }
};
