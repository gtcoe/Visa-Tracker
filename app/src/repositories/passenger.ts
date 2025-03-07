import constants from "../config/constants";
import { generateError } from "../services/util";
import { logger } from "../logging";
import Mysql from "../database/mySql";

export interface PassengerData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
  phone: string;
  processing_branch: number;
  passport_number: string;
  passport_date_of_issue: string;
  passport_date_of_expiry: string;
  passport_issue_at: string;
  count_of_expired_passport: string;
  expired_passport_number: string;
  address_line_1: string;
  address_line_2: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  occupation: string;
  position: string;
  status: number;
  last_updated_by: number;
}

export interface GetPassengerDataDBResponse {
  status: boolean;
  data: PassengerData[] | null;
}

const passengerRepository = () => {
  //Done
  const insertPassenger = async (data: PassengerData): Promise<any> => {
    try {
      const query = `
      INSERT INTO ${constants.TABLES.PASSENGER}  
        (first_name, last_name, email, dob, phone, processing_branch, passport_number, 
         passport_date_of_issue, passport_date_of_expiry, passport_issue_at, 
         count_of_expired_passport, expired_passport_number, address_line_1, 
         address_line_2, country, state, city, zip, occupation, position, last_updated_by, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const params = [
        data.first_name,
        data.last_name,
        data.email,
        data.dob,
        data.phone,
        data.processing_branch,
        data.passport_number,
        data.passport_date_of_issue,
        data.passport_date_of_expiry,
        data.passport_issue_at,
        data.count_of_expired_passport,
        data.expired_passport_number,
        data.address_line_1,
        data.address_line_2,
        data.country,
        data.state,
        data.city,
        data.zip,
        data.occupation,
        data.position,
        data.last_updated_by,
        data.status,
      ];
      const resp = await Mysql.query(query, params);

      if (resp.data?.insertId) {
        insertPassengerHistory(resp.data.insertId);
      }
      return resp;
    } catch (e) {
      logger.error(`Error in insertPassenger: ${generateError(e)}`);
      throw e;
    }
  };

  //Done
  const insertPassengerHistory = async (
    userId: number | undefined
  ): Promise<void> => {
    try {
      const query = `INSERT INTO ${constants.TABLES.PASSENGER_HISTORY} 
                (application_id, first_name, last_name, email, dob, phone, processing_branch, passport_number, 
                  passport_date_of_issue, passport_date_of_expiry, passport_issue_at, 
                  count_of_expired_passport, expired_passport_number, address_line_1, 
                  address_line_2, country, state, city, zip, occupation, position, last_updated_by, status) 
                SELECT id, first_name, last_name, email, dob, phone, processing_branch, passport_number, 
                    passport_date_of_issue, passport_date_of_expiry, passport_issue_at, 
                    count_of_expired_passport, expired_passport_number, address_line_1, 
                    address_line_2, country, state, city, zip, occupation, position, last_updated_by, status  
                FROM ${constants.TABLES.PASSENGER} WHERE id = ?`;
      await Mysql.query(query, [userId]);
    } catch (e) {
      logger.error(`Error in insertPassengerHistory: ${generateError(e)}`);
      throw e;
    }
  };

  const search = async (
    passenger_ids: number[],
    name: string,
    passport_number: string
  ): Promise<GetPassengerDataDBResponse> => {
    try {
      let query = `SELECT id, first_name, last_name, email, dob, phone, processing_branch, passport_number, 
      passport_date_of_issue, passport_date_of_expiry, passport_issue_at, 
      count_of_expired_passport, expired_passport_number, address_line_1, 
      address_line_2, country, state, city, zip, occupation, position, last_updated_by, status FROM ${constants.TABLES.PASSENGER} WHERE `;

      let where: string = "";
      if (name.length > 0) {
        where = ` first_name LIKE '%${name}%' and last_name LIKE '%${name}%' `;
      }

      if (passport_number.length > 0) {
        if (where.length > 0) {
          where += " and ";
        }
        where += ` passport_number LIKE '%${passport_number}%' `;
      }

      if (passenger_ids.length > 0) {
        if (where.length > 0) {
          where += " and ";
        }
        where += ` id in (${passenger_ids.join(", ")}) `;
      }

      query += where;
      query += " ORDER BY id DESC";

      return await Mysql.query<PassengerData[]>(query, []);
    } catch (e) {
      logger.error(`Error in search: ${generateError(e)}`);
      throw e;
    }
  };

  const getByPassengerIds = async (
    passenger_ids: number[]
  ): Promise<GetPassengerDataDBResponse> => {
    try {
      if (passenger_ids.length === 0) {
        return {
          status: false,
          data: null,
        };
      }

      let query = `SELECT id, first_name, last_name, email, dob, phone, processing_branch, passport_number, 
      passport_date_of_issue, passport_date_of_expiry, passport_issue_at, 
      count_of_expired_passport, expired_passport_number, address_line_1, 
      address_line_2, country, state, city, zip, occupation, position, last_updated_by, status FROM ${constants.TABLES.PASSENGER} WHERE `;

      let where: string = "";

      if (passenger_ids.length > 0) {
        if (where.length > 0) {
          where += " and ";
        }
        where += ` id in (${passenger_ids.join(", ")}) `;
      }

      query += where;
      query += " ORDER BY id DESC";

      return await Mysql.query<PassengerData[]>(query, []);
    } catch (e) {
      logger.error(`Error in search: ${generateError(e)}`);
      throw e;
    }
  };

  return {
    insertPassenger,
    getByPassengerIds,
    search,
  };
};

export default passengerRepository;
