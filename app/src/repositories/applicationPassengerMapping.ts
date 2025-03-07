import constants from "../config/constants";
import { generateError } from "../services/util";
import { logger } from "../logging";
import Mysql from "../database/mySql";
import moment from "moment";
import { AddStep1DataRequest } from "../models/Application/addStep1DataRequest";
import {} from "../models/Application/addStep3DataRequest";

export interface ApplicationPassengerMappingData {
  id?: number;
  application_id?: number;
  passenger_id?: number;
  last_updated_by?: number;
  status?: number;
}

export interface GetApplicationPassengerMappingDataDBResponse {
  status: boolean;
  data: ApplicationPassengerMappingData[] | null;
}

const applicationPassengerMappingRepository = () => {
  //Done
  const insert = async (
    data: ApplicationPassengerMappingData
  ): Promise<any> => {
    try {
      const query = `INSERT INTO ${constants.TABLES.APPLICATION_PASSENGER_MAPPING} 
                (application_id,  passenger_id, last_updated_by, status) 
                VALUES (?, ?, ?, ?)`;
      const params = [
        data.application_id,
        data.passenger_id,
        data.status,
        data.last_updated_by,
      ];
      const resp = await Mysql.query(query, params);

      if (resp.data?.insertId) {
        insertHistory(resp.data.insertId);
      }
      return resp;
    } catch (e) {
      logger.error(`Error in insert: ${generateError(e)}`);
      throw e;
    }
  };

  //Done
  const insertHistory = async (mappingId: number): Promise<void> => {
    try {
      const query = `INSERT INTO ${constants.TABLES.APPLICATION_PASSENGER_MAPPING_HISTORY} 
                (mapping_id, application_id,  passenger_id, last_updated_by, status) 
                SELECT id, application_id,  passenger_id, last_updated_by, status  
                FROM ${constants.TABLES.APPLICATION_PASSENGER_MAPPING} WHERE id = ?`;
      await Mysql.query(query, [mappingId]);
    } catch (e) {
      logger.error(`Error in insertHistory: ${generateError(e)}`);
      throw e;
    }
  };

  //Done
  const getByApplicationIds = async (
    application_ids: number[],
    status: number[]
  ): Promise<GetApplicationPassengerMappingDataDBResponse> => {
    try {
      if (application_ids.length === 0) {
        return {
          status: false,
          data: null,
        };
      }
      const applicationIds: string = `${application_ids.join(", ")}`;
      const statusStr: string = `${status.join(", ")}`;

      const query = `SELECT id, application_id,  passenger_id, last_updated_by, status FROM ${constants.TABLES.APPLICATION_PASSENGER_MAPPING} WHERE application_id in (?) and status in (?)`;
      const params = [applicationIds, statusStr];
      return await Mysql.query<ApplicationPassengerMappingData[]>(
        query,
        params
      );
    } catch (e) {
      logger.error(`Error in getByApplicationIds: ${generateError(e)}`);
      throw e;
    }
  };

  return {
    insert,
    insertHistory,
    getByApplicationIds,
  };
};

export default applicationPassengerMappingRepository;
