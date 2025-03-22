import constants from "../config/constants";
import { logger } from "../logging";
import Response from "../models/response";
import { generateError, generateRandomString } from "../services/util";
import ApplicationRepository, {
  ApplicationData as RepoApplicationData,
  GetApplicationDataDBResponse,
} from "../repositories/application";
import userRepositoryFactory, {
  GetUserDataDBResponse,
} from "../repositories/user";

import passengerRepositoryFactory, {
  PassengerData as RepoPassengerData,
  GetPassengerDataDBResponse,
} from "../repositories/passenger";
import applicationPassengerRepositoryFactory, {
  ApplicationPassengerMappingData,
  GetApplicationPassengerMappingDataDBResponse,
} from "../repositories/applicationPassengerMapping";
import { AddStep1DataRequest } from "../models/Application/addStep1DataRequest";
import { AddStep2DataRequest } from "../models/Application/addStep2DataRequest";
import { AddStep3DataRequest, PersonalInfo, PassportInfo, AddressInfo } from "../models/Application/addStep3DataRequest";
import { AddStep4DataRequest } from "../models/Application/addStep4DataRequest";
import { SearchPaxRequest } from "../models/Application/searchPax";
import { SearchRequest } from "../models/Application/tracker";
import MySql from "../database/mySql";
import ResponseModel from "../models/response";
import { ApplicationData, PassengerData, ApplicationPassengerMapping } from "../models/Application/applicationDatabaseModels";
import { QUEUE_TO_STATUS, STATUS_TO_QUEUE, APPLICATION_QUEUES, APPLICATION_EXTERNAL_STATUS } from "../config/applicationStatus";

const applicationService = () => {
  const applicationRepository = ApplicationRepository();
  const userRepository = userRepositoryFactory();
  const passengerRepository = passengerRepositoryFactory();
  const applicationPassengerRepository = applicationPassengerRepositoryFactory();

  //Done
  const addStep1Data = async (request: AddStep1DataRequest): Promise<any> => {
    const response = new Response(false);
    try {
      /// Client User verifications
      // Fetch user info using email
      const userResponse: GetUserDataDBResponse | null =
        await userRepository.getByID(request.client_user_id);

      // Error Fetching userInfo
      if (!userResponse || !userResponse.status) {
        throw new Error("Unable to fetch user info");
      }

      // User with this email already exists
      if ((userResponse?.data || []).length == 0) {
        response.setMessage(
          `Invalid Client User ID: ${request.client_user_id}`
        );
        return response;
      }

      // client status check
      if (userResponse?.data?.[0]?.status !== constants.STATUS.USER.ACTIVE) {
        response.setMessage(`Client currently inactive`);
        return response;
      }

      request.status = constants.STATUS.APPLICATION.STEP1_DONE;
      request.reference_number =
        generateRandomString(3, "alpha") + generateRandomString(4, "num");
      // Create Application
      const resp: any = await applicationRepository.insertAddStep1Data(request);
      if (!resp.status) {
        throw new Error("Unable to create application");
      }

      response.setStatus(true);
      response.data = {
        "application_id": resp.data?.insertId,
        "reference_number": request.reference_number,
      }
      return response;
    } catch (e) {
      logger.error(
        `error in applicationService.addStep1Data - ${generateError(e)}`
      );
      throw e;
    }
  };

  //Done
  const addStep2Data = async (request: AddStep2DataRequest): Promise<any> => {
    const response = new Response(false);
    try {
      /// Fetch passenger data
      const passengerResponse: GetPassengerDataDBResponse =
        await passengerRepository.getByPassengerIds([request.pax_id]);

      // Error Fetching passengerInfo
      if (!passengerResponse || !passengerResponse.status) {
        throw new Error(
          `unable to fetch passenger info by pax_id: ${request.pax_id}`
        );
      }

      const passengerInfo: RepoPassengerData | null = passengerResponse.data
        ? passengerResponse.data[0]
        : null;
      if (passengerInfo == null) {
        response.setMessage(`Invalid Passenger ID: ${request.pax_id}`);
        return response;
      }

      if (passengerInfo.status !== constants.STATUS.PASSENGER.ACTIVE) {
        response.setMessage(
          `Passenger with ID: ${request.pax_id} is currently inactive`
        );
        return response;
      }

      /// Fetch Application data
      const applicationResponse: GetApplicationDataDBResponse =
        await applicationRepository.getById(
          request.application_id
        );

      // Error Fetching passengerInfo
      if (!applicationResponse || !applicationResponse.status) {
        throw new Error(
          `unable to fetch application info by reference_number: ${request.application_id}`
        );
      }

      const applicationInfo: RepoApplicationData | null = applicationResponse.data
        ? applicationResponse.data[0]
        : null;
      if (applicationInfo == null) {
        response.setMessage(
          `Invalid application_id: ${request.application_id}`
        );
        return response;
      }

      // TODO: Add this once the status check is done in the frontend
      // if (applicationInfo.status !== constants.STATUS.APPLICATION.STEP1_DONE) {
      //   response.setMessage(`Application with ID: ${request.reference_number} is currently on wrong status: ${applicationInfo.status}`);
      //   return response;
      // }

      // create application passenger mapping
      const insertResponse: any = await applicationPassengerRepository.insert({
        application_id: applicationInfo.id,
        passenger_id: request.pax_id,
        status: constants.STATUS.APPLICATION_PASSENGER_MAPPING.ACTIVE,
        last_updated_by: request.last_updated_by,
      });
      if (!insertResponse.status) {
        throw new Error("Unable to insert application passenger mapping");
      }

      // update application status
      const updateResponse: any = await applicationRepository.updateStatus(
        constants.STATUS.APPLICATION_PASSENGER_MAPPING.ACTIVE,
        applicationInfo.id || 0,
        request.last_updated_by
      );
      if (!updateResponse.status) {
        throw new Error("Unable to update application status");
      }

      response.setStatus(true);
      return response;
    } catch (e) {
      logger.error(
        `error in applicationService.addStep1Data - ${generateError(e)}`
      );
      throw e;
    }
  };

  //Done
  const searchPax = async (request: SearchPaxRequest): Promise<any> => {
    const response = new Response(false);
    try {
      let passengerIds: number[] = [];
      if (request.reference_number.length > 0) {
        const applicationResponse: GetApplicationDataDBResponse =
          await applicationRepository.searchSubmittedApplicationsByReferenceNumber(
            request.reference_number,
            constants.STATUS.APPLICATION.STEP4_DONE
          );

        // Error Fetching applicationResponse
        if (!applicationResponse || !applicationResponse.status) {
          throw new Error(
            `unable to fetch application info by reference_number: ${request.reference_number}`
          );
        }

        const applicationsInfo: RepoApplicationData[] = applicationResponse.data
          ? applicationResponse.data
          : [];
        if (applicationsInfo.length > 0) {
          const applicationids: number[] = applicationsInfo
            .map((app) => app.id)
            .filter((id): id is number => id !== undefined);

          const mappingResponse: GetApplicationPassengerMappingDataDBResponse =
            await applicationPassengerRepository.getByApplicationIds(
              applicationids,
              [constants.STATUS.APPLICATION_PASSENGER_MAPPING.ACTIVE]
            );

          // Error Fetching applicationResponse
          if (!mappingResponse || !mappingResponse.status) {
            throw new Error(
              `unable to fetch mapping info by application ids: ${applicationids}`
            );
          }
          const mappingInfo: ApplicationPassengerMappingData[] =
            mappingResponse.data ? mappingResponse.data : [];

          passengerIds = mappingInfo
            .map((app) => app.passenger_id)
            .filter((id): id is number => id !== undefined);
        }
      }

      // if reference number present, fetch related passenger id
      // add pax_name and passport_number as or if present
      const passengerResponse: GetPassengerDataDBResponse =
        await passengerRepository.search(
          passengerIds,
          request.pax_name,
          request.passport_number
        );

      // Error Fetching applicationResponse
      if (!passengerResponse || !passengerResponse.status) {
        throw new Error(
          `unable to fetch passenger info by passengerIds: ${passengerIds}, request.pax_name: ${request.pax_name}, request.passport_number: ${request.passport_number}`
        );
      }
      const mappingInfo: RepoPassengerData[] = passengerResponse.data
        ? passengerResponse.data
        : [];

      response.setStatus(true);
      response.setData("passengers_info", mappingInfo);
      return response;
    } catch (e) {
      logger.error(
        `error in applicationService.searchPax - ${generateError(e)}`
      );
      throw e;
    }
  };

  //Done
  const addStep4Data = async (request: AddStep4DataRequest): Promise<any> => {
    const response = new Response(false);
    try {
      /// Fetch Application data
      const applicationResponse: GetApplicationDataDBResponse =
        await applicationRepository.getByReferenceNumber(
          request.reference_number
        );

      // Error Fetching passengerInfo
      if (!applicationResponse || !applicationResponse.status) {
        throw new Error(
          `unable to fetch application info by reference_number: ${request.reference_number}`
        );
      }

      const applicationInfo: RepoApplicationData | null = applicationResponse.data
        ? applicationResponse.data[0]
        : null;
      if (applicationInfo == null) {
        response.setMessage(
          `Invalid application reference_number: ${request.reference_number}`
        );
        return response;
      }

      // if (applicationInfo.status !== constants.STATUS.APPLICATION.STEP1_DONE) {
      //   response.setMessage(`Application with ID: ${request.reference_number} is currently on wrong status: ${applicationInfo.status}`);
      //   return response;
      // }

      // update application status and details
      const updateResponse: any = await applicationRepository.updateStep4Data(
        request,
        applicationInfo.id || 0
      );
      if (!updateResponse.status) {
        throw new Error("Unable to update application status");
      }

      response.setStatus(true);
      return response;
    } catch (e) {
      logger.error(
        `error in applicationService.addStep4Data - ${generateError(e)}`
      );
      throw e;
    }
  };

  const search = async (request: SearchRequest): Promise<any> => {
    const response = new Response(false);
    try {
      response.setStatus(true);
      return response;
    } catch (e) {
      logger.error(
        `error in applicationService.SearchRequest - ${generateError(e)}`
      );
      throw e;
    }
  };

  const verifyPassengerChange = async (savedPassengerinfo: RepoPassengerData, newPassengerinfo: PersonalInfo, newPassportInfo: PassportInfo, newAddressInfo: AddressInfo) => {
    // Check if there are any changes in passenger details
    const isPersonalInfoSame = 
      savedPassengerinfo.first_name === newPassengerinfo.first_name &&
      savedPassengerinfo.last_name === newPassengerinfo.last_name &&
      savedPassengerinfo.email === newPassengerinfo.email_id &&
      savedPassengerinfo.dob === newPassengerinfo.date_of_birth &&
      savedPassengerinfo.processing_branch === newPassengerinfo.processing_branch;
    
    const isPassportInfoSame =
      savedPassengerinfo.passport_number === newPassportInfo.passport_number &&
      savedPassengerinfo.passport_date_of_issue === newPassportInfo.date_of_issue &&
      savedPassengerinfo.passport_date_of_expiry === newPassportInfo.date_of_expiry &&
      savedPassengerinfo.passport_issue_at === newPassportInfo.issue_at &&
      String(savedPassengerinfo.count_of_expired_passport) === String(newPassportInfo.no_of_expired_passport) &&
      savedPassengerinfo.expired_passport_number === newPassportInfo.expired_passport_number;
    
    const isAddressInfoSame =
      savedPassengerinfo.address_line_1 === newAddressInfo.address_line1 &&
      (savedPassengerinfo.address_line_2 || '') === (newAddressInfo.address_line2 || '') &&
      String(savedPassengerinfo.country) === String(newAddressInfo.country) &&
      String(savedPassengerinfo.state) === String(newAddressInfo.state) &&
      String(savedPassengerinfo.city) === String(newAddressInfo.city) &&
      savedPassengerinfo.zip === newAddressInfo.zip &&
      savedPassengerinfo.occupation === newAddressInfo.occupation &&
      savedPassengerinfo.position === newAddressInfo.position;
    
    // If all information is the same, we can continue with the existing passenger
    // If any information has changed, we need to create a new passenger and update mapping
    const isAllInfoSame = isPersonalInfoSame && isPassportInfoSame && isAddressInfoSame;
    
    return {
      isChanged: !isAllInfoSame,
      // If we need detailed info on what's changed later:
      details: {
        isPersonalInfoSame,
        isPassportInfoSame,
        isAddressInfoSame
      }
    };
  }

  const addStep3Data = async (
    request: AddStep3DataRequest
  ): Promise<ResponseModel> => {
    const response = new ResponseModel(false);
    let connection: any;
    
    try {
      connection = await MySql.getConnection();
      await connection.beginTransaction();
      
      const { 
        personal_info, 
        passport_info, 
        travel_info, 
        visa_requests, 
        address_info, 
        mi_fields, 
        application_id,
        token_user_id
      } = request;
      
      // 1. First check if application exists and get passenger mapping in a single query
      const applicationAndMappingQuery = `
        SELECT app.*, 
               apm.passenger_id, 
               p.first_name, p.last_name, p.email, p.dob, p.processing_branch,
               p.passport_number, p.passport_date_of_issue, p.passport_date_of_expiry, 
               p.passport_issue_at, p.count_of_expired_passport, p.expired_passport_number,
               p.address_line_1, p.address_line_2, p.country, p.state, p.city, p.zip, 
               p.occupation, p.position, p.status, p.last_updated_by
        FROM applications app
        LEFT JOIN application_passenger_mapping apm ON app.id = apm.application_id
        LEFT JOIN passengers p ON apm.passenger_id = p.id
        WHERE app.id = ?`;
      
      const result = await connection.query(applicationAndMappingQuery, [application_id]);
      
      if (!result.data || result.data.length === 0) {
        response.message = `Application with ID ${application_id} not found`;
        return response;
      }

      const applicationData = result.data[0];
      
      let passengerId;
      let passengerExists = false;
      
      // Check if passenger already exists for this application
      if (applicationData.passenger_id) {
        passengerExists = true;
        passengerId = applicationData.passenger_id;
        
        // Create a RepoPassengerData object from the joined query results
        const passengerInfo: RepoPassengerData = {
          id: applicationData.passenger_id,
          first_name: applicationData.first_name,
          last_name: applicationData.last_name,
          email: applicationData.email,
          dob: applicationData.dob,
          phone: applicationData.phone || "",
          processing_branch: applicationData.processing_branch,
          passport_number: applicationData.passport_number,
          passport_date_of_issue: applicationData.passport_date_of_issue,
          passport_date_of_expiry: applicationData.passport_date_of_expiry,
          passport_issue_at: applicationData.passport_issue_at,
          count_of_expired_passport: applicationData.count_of_expired_passport,
          expired_passport_number: applicationData.expired_passport_number,
          address_line_1: applicationData.address_line_1,
          address_line_2: applicationData.address_line_2 || "",
          country: applicationData.country,
          state: applicationData.state,
          city: applicationData.city,
          zip: applicationData.zip,
          occupation: applicationData.occupation,
          position: applicationData.position,
          status: applicationData.status,
          last_updated_by: applicationData.last_updated_by
        };

        // Verify if passenger details have changed
        const verifyPassengerChangeResponse = await verifyPassengerChange(passengerInfo, personal_info, passport_info, address_info);

        if (verifyPassengerChangeResponse.isChanged) {
          // Insert new passenger if details have changed
          const insertPassengerQuery = `
          INSERT INTO passengers (
            first_name, last_name, email, dob, processing_branch,
            passport_number, passport_date_of_issue, passport_date_of_expiry, passport_issue_at,
            count_of_expired_passport, expired_passport_number,
            address_line_1, address_line_2, country, state, city, zip, 
            occupation, position, last_updated_by
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?
          )`;

          const insertPassengerParams = [
            personal_info.first_name,
            personal_info.last_name,
            personal_info.email_id,
            personal_info.date_of_birth,
            personal_info.processing_branch,
            passport_info.passport_number,
            passport_info.date_of_issue,
            passport_info.date_of_expiry,
            passport_info.issue_at,
            passport_info.no_of_expired_passport,
            passport_info.expired_passport_number,
            address_info.address_line1,
            address_info.address_line2 || '',
            address_info.country,
            address_info.state,
            address_info.city,
            address_info.zip,
            address_info.occupation,
            address_info.position,
            token_user_id
          ];

          const passengerResult = await connection.query(insertPassengerQuery, insertPassengerParams);
          passengerId = passengerResult.data.insertId;

          // Create mapping between application and passenger
          const insertMappingQuery = `
          INSERT INTO application_passenger_mapping (
            application_id, passenger_id, last_updated_by
          ) VALUES (?, ?, ?)`;

          await connection.query(insertMappingQuery, [
            application_id, 
            passengerId,
            token_user_id 
          ]);
        }
      } else {
        // Insert new passenger if none exists
        const insertPassengerQuery = `
        INSERT INTO passengers (
          first_name, last_name, email, dob, processing_branch,
          passport_number, passport_date_of_issue, passport_date_of_expiry, passport_issue_at,
          count_of_expired_passport, expired_passport_number,
          address_line_1, address_line_2, country, state, city, zip, 
          occupation, position, last_updated_by
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?
        )`;

        const insertPassengerParams = [
          personal_info.first_name,
          personal_info.last_name,
          personal_info.email_id,
          personal_info.date_of_birth,
          personal_info.processing_branch,
          passport_info.passport_number,
          passport_info.date_of_issue,
          passport_info.date_of_expiry,
          passport_info.issue_at,
          passport_info.no_of_expired_passport,
          passport_info.expired_passport_number,
          address_info.address_line1,
          address_info.address_line2 || '',
          address_info.country,
          address_info.state,
          address_info.city,
          address_info.zip,
          address_info.occupation,
          address_info.position,
          token_user_id
        ];

        const passengerResult = await connection.query(insertPassengerQuery, insertPassengerParams);
        passengerId = passengerResult.data.insertId;

        // Create mapping between application and passenger
        const insertMappingQuery = `
        INSERT INTO application_passenger_mapping (
          application_id, passenger_id, last_updated_by
        ) VALUES (?, ?, ?)`;

        await connection.query(insertMappingQuery, [
          application_id, 
          passengerId,
          token_user_id 
        ]);
      }
      
      // Update application with travel info and first visa request
      const updateApplicationQuery = `
        UPDATE applications 
        SET 
          travel_date = ?,
          interview_date = ?,
          file_number_1 = ?,
          is_travel_date_tentative = ?,
          priority_submission = ?,
          visa_country = ?,
          visa_category = ?,
          nationality = ?,
          state_id = ?,
          entry_type = ?,
          remarks = ?,
          olvt_number = ?,
          external_status = ?,
          status = ?,
          queue = ?
        WHERE id = ?`;
      
      const updateApplicationParams = [
        travel_info.travel_date,
        travel_info.interview_date,
        travel_info.file_no,
        travel_info.is_travel_date_tentative,
        travel_info.priority_submission,
        visa_requests[0].visa_country,
        visa_requests[0].visa_category,
        visa_requests[0].nationality,
        visa_requests[0].state,
        visa_requests[0].entry_type,
        visa_requests[0].remark || '',
        mi_fields?.olvt_number,
        APPLICATION_EXTERNAL_STATUS.IN_TRANSIT,
        APPLICATION_QUEUES.IN_TRANSIT,
        constants.STATUS.APPLICATION.STEP3_DONE,
        application_id
      ];
      
      await connection.query(updateApplicationQuery, updateApplicationParams);
      
      // Handle multiple visa requests with better performance by committing the current transaction
      // and creating a new one for additional visa requests
      await connection.commit();
      
      // If there are multiple visa requests, create additional applications
      if (visa_requests.length > 1) {
        // Start a new transaction for additional visa requests
        await connection.beginTransaction();
        
        // Prepare a single batch insert for all additional applications (if database supports it)
        const createApplicationQuery = `
          INSERT INTO applications (
            client_user_id, pax_type, country_of_residence, 
            state_of_residence, citizenship, service_type, referrer,
            file_number_1, travel_date, interview_date,
            is_travel_date_tentative, priority_submission, reference_number,
            visa_country, visa_category, nationality, state_id, entry_type, remarks,
            olvt_number, external_status, status, queue, last_updated_by
          ) VALUES ?`;
          
        // Create the values array for batch insert
        const additionalVisaValues = [];
        
        for (let i = 1; i < visa_requests.length; i++) {
          additionalVisaValues.push([
            applicationData.client_user_id,
            applicationData.pax_type,
            applicationData.country_of_residence,
            applicationData.state_of_residence, 
            applicationData.citizenship,
            applicationData.service_type,
            applicationData.referrer,
            travel_info.file_no,
            travel_info.travel_date,
            travel_info.interview_date,
            travel_info.is_travel_date_tentative,
            travel_info.priority_submission,
            applicationData.reference_number,
            visa_requests[i].visa_country,
            visa_requests[i].visa_category,
            visa_requests[i].nationality,
            visa_requests[i].state,
            visa_requests[i].entry_type,
            visa_requests[i].remark || '',
            mi_fields?.olvt_number,
            APPLICATION_EXTERNAL_STATUS.IN_TRANSIT,
            APPLICATION_QUEUES.IN_TRANSIT,
            constants.STATUS.APPLICATION.STEP3_DONE,
            token_user_id
          ]);
        }
        
        // Execute batch insert if there are additional visa requests
        if (additionalVisaValues.length > 0) {
          // Note: MySQL syntax requires nested arrays for multiple row insert
          const additionalAppsResult = await connection.query(createApplicationQuery, [additionalVisaValues]);
          
          // Get the inserted IDs to create mappings
          const insertedIds = [];
          if (additionalAppsResult.data && additionalAppsResult.data.insertId) {
            const firstInsertId = additionalAppsResult.data.insertId;
            for (let i = 0; i < additionalVisaValues.length; i++) {
              insertedIds.push(firstInsertId + i);
            }
          }
          
          // Create batch mappings for all new applications
          if (insertedIds.length > 0) {
            const insertMappingQuery = `
              INSERT INTO application_passenger_mapping (
                application_id, passenger_id, last_updated_by
              ) VALUES ?`;
              
            const mappingValues = insertedIds.map(appId => [
              appId, 
              passengerId,
              token_user_id
            ]);
            
            await connection.query(insertMappingQuery, [mappingValues]);
          }
        }
        
        // Commit the second transaction
        await connection.commit();
      }
      
      response.setStatus(true);
      response.message = "Application Updated Successfully.";
      response.data = {
        application_requests: request
      };
      
      return response;
    } catch (e) {
      if (connection) await connection.rollback();
      logger.error(`Error in ApplicationService.addStep3Data: ${generateError(e)}`);
      response.message = "Failed to save application step 3 data";
      return response;
    } finally {
      if (connection) connection.release();
    }
  };

  return {
    addStep1Data,
    addStep2Data,
    addStep3Data,
    addStep4Data,
    searchPax,
    search,
  };
};

export default applicationService;
