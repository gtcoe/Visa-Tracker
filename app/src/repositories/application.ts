import constants from "../config/constants";
import { generateError } from "../services/util";
import { logger } from "../logging";
import Mysql from "../database/mySql";
import moment from "moment";
import { AddStep1DataRequest } from "../models/Application/addStep1DataRequest";
import {  } from "../models/Application/addStep3DataRequest";
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
      const query = `SELECT id FROM ${constants.TABLES.APPLICATION} WHERE reference_number LIKE '%?%' and status = ?`;
      const params = [reference_number, status];
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
      const query = `UPDATE ${constants.TABLES.APPLICATION} 
                SET status = ?, last_updated_by = ?, remarks = ?, dispatch_medium = ?, dispatch_medium_number = ? 
                WHERE id = ?`;
      const params = [constants.STATUS.APPLICATION.STEP4_DONE, request.last_updated_by, request.remarks, request.dispatch_medium, request.dispatch_medium_number, applicationId];
      const resp = await Mysql.query(query, params);
      if (resp.data.affectedRows > 0) {
        insertHistory(applicationId);
      }
      return resp
    } catch (e) {
      logger.error(`Error in updateStep4Data: ${generateError(e)}`);
      throw e;
    }
  };

  return {
    insertAddStep1Data,
    getByReferenceNumber,
    getById,
    updateStatus,
    searchSubmittedApplicationsByReferenceNumber,
    updateStep4Data,
  };
};

export default applicationRepository;
