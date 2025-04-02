import constants from "../config/constants/constants";
import { generateError } from "../services/util";
import { logger } from "../logging";
import Mysql from "../database/mySql";
import { AddStep1DataRequest } from "../models/Application/addStep1DataRequest";
import { AddStep4DataRequest } from "../models/Application/addStep4DataRequest";

export interface ApplicationData {
  id?: number;
  reference_number?: string;
  pax_type: number;
  country_of_residence: number;
  client_user_id: number;
  state_of_residence: number;
  citizenship: number;
  service_type: number;
  referrer: string;
  file_number_1: string;
  travel_date?: string;
  interview_date?: string;
  file_number_2?: string;
  is_travel_date_tentative?: number;
  priority_submission?: number;
  status: number;
  queue: number;
  external_status?: number;
  olvt_number?: string;
  processing_branch?: string;
  team_remarks?: string;
  client_remarks?: string;
  billing_remarks?: string;
  remarks?: string;
  dispatch_medium?: number;
  dispatch_medium_number?: string;
  last_updated_by: number,
}

export interface GetApplicationDataDBResponse {
  status: boolean;
  data: ApplicationData[] | null;
}

const applicationRepository = () => {

  //Done
  const insertAddStep1Data = async (
    data: AddStep1DataRequest
  ): Promise<any> => {
    try {
      const query = `INSERT INTO ${constants.TABLES.APPLICATION} 
                (pax_type, country_of_residence, client_user_id, state_of_residence, file_number_1, service_type, referrer, citizenship, status, last_updated_by, reference_number) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [
        data.pax_type,
        data.country_of_residence,
        data.client_user_id,
        data.state_of_residence,
        data.file_number,
        data.service_type,
        data.referrer,
        data.citizenship,
        data.status,
        data.last_updated_by,
        data.reference_number,
      ];
      const resp = await Mysql.query(query, params);
      
      if (resp.data?.insertId) {
        insertHistory(resp.data.insertId);
      }
      return resp;
    } catch (e) {
      logger.error(`Error in insertAddStep1Data: ${generateError(e)}`);
      throw e;
    }
  };

  //Done
  const insertHistory = async (
    applicationId: number 
  ): Promise<void> => {
    try {
      const query = `INSERT INTO ${constants.TABLES.APPLICATION_HISTORY} 
                (application_id, reference_number, pax_type, country_of_residence, client_user_id, state_of_residence, file_number_1, service_type, referrer, citizenship, travel_date, is_travel_date_tentative, priority_submission, interview_date, file_number_2, external_status, queue, status, olvt_number, team_remarks, client_remarks, billing_remarks, last_updated_by) 
                SELECT id, reference_number, pax_type, country_of_residence, client_user_id, state_of_residence, file_number_1, service_type, referrer, citizenship, travel_date, is_travel_date_tentative, priority_submission, interview_date, file_number_2, external_status, queue, status, olvt_number, team_remarks, client_remarks, billing_remarks, last_updated_by 
                FROM ${constants.TABLES.APPLICATION} WHERE id = ?`;
      await Mysql.query(query, [applicationId]);
    } catch (e) {
      logger.error(`Error in insertApplicationHistory: ${generateError(e)}`);
      throw e;
    }
  };

  //Done
  const getByReferenceNumber = async (reference_number: string): Promise<GetApplicationDataDBResponse> => {
    try {
      const query = `SELECT id, reference_number, pax_type, country_of_residence, client_user_id, state_of_residence, file_number_1, service_type, referrer, citizenship, travel_date, is_travel_date_tentative, priority_submission, interview_date, file_number_2, external_status, queue, status, olvt_number, team_remarks, client_remarks, billing_remarks, last_updated_by FROM ${constants.TABLES.APPLICATION} WHERE reference_number = ? `;
      const params = [reference_number];
      return await Mysql.query<ApplicationData[]>(query, params);
    } catch (e) {
      logger.error(`Error in getByReferenceNumber: ${generateError(e)}`);
      throw e;
    }
  };

    //Done
    const getById = async (id: number): Promise<GetApplicationDataDBResponse> => {
      try {
        const query = `SELECT id, reference_number, pax_type, country_of_residence, client_user_id, state_of_residence, file_number_1, service_type, referrer, citizenship, travel_date, is_travel_date_tentative, priority_submission, interview_date, file_number_2, external_status, queue, status, olvt_number, team_remarks, client_remarks, billing_remarks, last_updated_by FROM ${constants.TABLES.APPLICATION} WHERE id = ? `;
        const params = [id];
        return await Mysql.query<ApplicationData[]>(query, params);
      } catch (e) {
        logger.error(`Error in getById: ${generateError(e)}`);
        throw e;
      }
    };

  //Done
  const searchSubmittedApplicationsByReferenceNumber = async (reference_number: string, status: number): Promise<GetApplicationDataDBResponse> => {
    try {
      const query = `SELECT id FROM ${constants.TABLES.APPLICATION} WHERE reference_number LIKE '%${reference_number}%' and status = ?`;
      const params = [status];
      return await Mysql.query<ApplicationData[]>(query, params);
    } catch (e) {
      logger.error(`Error in searchSubmittedApplicationsByReferenceNumber: ${generateError(e)}`);
      throw e;
    }
  };

  //Done
  const updateStatus = async (
    status: number,
    applicationId: number,
    lastUpdatedBy: number
  ): Promise<any> => {
    try {
      const query = `UPDATE ${constants.TABLES.APPLICATION} 
                SET status = ?, last_updated_by = ? 
                WHERE id = ?`;
      const params = [status, lastUpdatedBy, applicationId];
      const resp = await Mysql.query(query, params);
      if (resp.data.affectedRows > 0) {
        insertHistory(applicationId);
      }
      return resp
    } catch (e) {
      logger.error(`Error in updateStatus: ${generateError(e)}`);
      throw e;
    }
  };

  const updateStep4Data = async (
    request: AddStep4DataRequest,
    applicationId: number,
  ): Promise<any> => {
    try {
      const query = `UPDATE ${constants.TABLES.APPLICATION} SET dispatch_medium = ?, 
          dispatch_medium_number = ?, remarks = ?, status = ?
          WHERE id = ?`;
      const params = [
        request.dispatch_medium,
        request.dispatch_medium_number,
        request.remarks,
        constants.STATUS.APPLICATION.STEP4_DONE,
        applicationId,
      ];

      const resp = await Mysql.query(query, params);
      if (resp.data?.affectedRows > 0) {
        insertHistory(applicationId);
      }
      return resp;
    } catch (e) {
      logger.error(`Error in updateStep4Data: ${generateError(e)}`);
      throw e;
    }
  };

  /**
   * Get application with passenger details in a single query
   */
  const getApplicationWithPassenger = async (
    applicationId: number,
    connection?: any
  ): Promise<GetApplicationDataDBResponse> => {
    try {
      const query = `
        SELECT app.*, 
               apm.passenger_id, 
               p.first_name, p.last_name, p.email, p.dob, p.phone, p.processing_branch,
               p.passport_number, p.passport_date_of_issue, p.passport_date_of_expiry, 
               p.passport_issue_at, p.count_of_expired_passport, p.expired_passport_number,
               p.address_line_1, p.address_line_2, p.country, p.state, p.city, p.zip, 
               p.occupation, p.position, p.last_updated_by as passenger_updated_by
        FROM ${constants.TABLES.APPLICATION} app
        LEFT JOIN ${constants.TABLES.APPLICATION_PASSENGER_MAPPING} apm ON app.id = apm.application_id
        LEFT JOIN ${constants.TABLES.PASSENGER} p ON apm.passenger_id = p.id
        WHERE app.id = ? and apm.status = ?`;
      
      if (connection) {
        return await connection.query(query, [applicationId, constants.STATUS.PASSENGER.ACTIVE]);
      } else {
        return await Mysql.query(query, [applicationId]);
      }
    } catch (e) {
      logger.error(`Error in getApplicationWithPassenger: ${generateError(e)}`);
      throw e;
    }
  };
  
  /**
   * Update Step 3 Data
   */
  const updateStep3Data = async (
    data: any,
    connection?: any
  ): Promise<any> => {
    try {
      const query = `
        UPDATE ${constants.TABLES.APPLICATION} 
        SET 
          travel_date = ?,
          interview_date = ?,
          file_number_2 = ?,
          is_travel_date_tentative = ?,
          priority_submission = ?,
          olvt_number = ?,
          external_status = ?,
          status = ?,
          queue = ?
        WHERE id = ?`;
      
      const params = [
        data.travel_date,
        data.interview_date,
        data.file_number_2,
        data.is_travel_date_tentative,
        data.priority_submission,
        data.olvt_number,
        data.external_status,
        data.status,
        data.queue,
        data.id
      ];
      
      let resp;
      if (connection) {
        resp = await connection.query(query, params);
      } else {
        resp = await Mysql.query(query, params);
      }
      
      if (resp.data?.affectedRows > 0) {
        if (connection) {
          await insertHistoryWithConnection(data.id, connection);
        } else {
          await insertHistory(data.id);
        }
      }
      
      return resp;
    } catch (e) {
      logger.error(`Error in updateStep3Data: ${generateError(e)}`);
      throw e;
    }
  };
  
  /**
   * Insert application history with connection
   */
  const insertHistoryWithConnection = async (
    applicationId: number,
    connection: any
  ): Promise<void> => {
    try {

      const query = `INSERT INTO ${constants.TABLES.APPLICATION_HISTORY} 
                (application_id, reference_number, pax_type, country_of_residence, client_user_id, state_of_residence, file_number_1, service_type, referrer, citizenship, travel_date, is_travel_date_tentative, priority_submission, interview_date, file_number_2, external_status, queue, status, olvt_number, team_remarks, client_remarks, billing_remarks, last_updated_by) 
                SELECT id, reference_number, pax_type, country_of_residence, client_user_id, state_of_residence, file_number_1, service_type, referrer, citizenship, travel_date, is_travel_date_tentative, priority_submission, interview_date, file_number_2, external_status, queue, status, olvt_number, team_remarks, client_remarks, billing_remarks, last_updated_by 
                FROM ${constants.TABLES.APPLICATION} WHERE id = ?`;
      await connection.query(query, [applicationId]);


      // const dateTimeNow = moment().format('YYYY-MM-DD HH:mm:ss');
      // const getApplicationData = await connection.query(
      //   `SELECT * FROM ${constants.TABLES.APPLICATION} WHERE id = ?`, [applicationId]
      // );
      // if (getApplicationData.data.length > 0) {
      //   const applicationData = getApplicationData.data[0];
      //   const historyQuery = `INSERT INTO ${constants.TABLES.APPLICATION_HISTORY} SET ?`;
      //   await connection.query(historyQuery, {...applicationData, application_id: applicationId, created_at: dateTimeNow});
      // }
    } catch (e) {
      logger.error(`Error in insertHistoryWithConnection: ${generateError(e)}`);
      throw e;
    }
  };
  
  /**
   * Batch insert multiple applications
   */
  const batchInsertApplications = async (
    applications: any[],
    connection: any
  ): Promise<any> => {
    try {
      if (applications.length === 0) {
        return { status: true, data: null };
      }
      
      // Extract all the field names from the first application
      const fields = Object.keys(applications[0]).join(', ');
      
      // Create the query with placeholders for each row
      const query = `
        INSERT INTO ${constants.TABLES.APPLICATION} (${fields})
        VALUES ?`;
      
      // Transform the applications array to array of arrays for batch insert
      const values = applications.map(app => Object.values(app));
      
      // Execute the batch insert
      const result = await connection.query(query, [values]);
      
      // Insert history records for each new application
      if (result.data?.insertId) {
        const firstInsertId = result.data.insertId;
        for (let i = 0; i < applications.length; i++) {
          await insertHistoryWithConnection(firstInsertId + i, connection);
        }
      }
      
      return result;
    } catch (e) {
      logger.error(`Error in batchInsertApplications: ${generateError(e)}`);
      throw e;
    }
  };

  return {
    insertAddStep1Data,
    getByReferenceNumber,
    getById,
    searchSubmittedApplicationsByReferenceNumber,
    updateStatus,
    updateStep4Data,
    insertHistory,
    getApplicationWithPassenger,
    updateStep3Data,
    batchInsertApplications
  };
};

export default applicationRepository;
