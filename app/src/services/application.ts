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
      
      // Get application and passenger data in a single query
      const applicationWithPassengerResult = await applicationRepository.getApplicationWithPassenger(
        application_id, 
        connection
      );
      
      if (!applicationWithPassengerResult.status || !applicationWithPassengerResult.data || applicationWithPassengerResult.data.length === 0) {
        response.message = `Application with ID ${application_id} not found`;
        return response;
      }

      const applicationData = applicationWithPassengerResult.data[0];
      
      // Process passenger information
      const passengerId = await processPassengerInformation(
        applicationData,
        personal_info,
        passport_info,
        address_info,
        token_user_id || 0,
        connection
      );
      
      // Update primary application
      await updatePrimaryApplication(
        application_id,
        travel_info,
        visa_requests[0],
        mi_fields,
        connection
      );
      
      // Commit the main transaction
      await connection.commit();
      
      // Handle additional visa requests if any
      if (visa_requests.length > 1) {
        await processAdditionalVisaRequests(
          applicationData,
          travel_info,
          visa_requests.slice(1),
          passengerId,
          mi_fields,
          token_user_id || 0,
          connection
        );
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

  /**
   * Process passenger information for an application
   * This handles both creating new passengers and updating existing ones
   */
  const processPassengerInformation = async (
    applicationData: any,
    personalInfo: PersonalInfo,
    passportInfo: PassportInfo,
    addressInfo: AddressInfo,
    userId: number,
    connection: any
  ): Promise<number> => {
    let passengerId;
    
    // Check if passenger already exists
    if (applicationData.passenger_id) {
      // Create passenger info object from application data
      const passengerInfo: RepoPassengerData = createPassengerInfoFromApplicationData(applicationData);
      
      // Verify if passenger details have changed
      const verifyResult = await verifyPassengerChange(
        passengerInfo,
        personalInfo,
        passportInfo,
        addressInfo
      );

      if (verifyResult.isChanged) {
        // Create new passenger with updated details
        passengerId = await createNewPassenger(
          personalInfo,
          passportInfo,
          addressInfo,
          userId,
          connection
        );

        // Create mapping between application and new passenger
        await applicationPassengerRepository.createMapping(
          applicationData.id!,
          passengerId,
          userId,
          connection
        );
      } else {
        // Use existing passenger
        passengerId = applicationData.passenger_id;
      }
    } else {
      // Create new passenger when none exists
      passengerId = await createNewPassenger(
        personalInfo,
        passportInfo,
        addressInfo,
        userId,
        connection
      );

      // Create mapping between application and new passenger
      await applicationPassengerRepository.createMapping(
        applicationData.id!,
        passengerId,
        userId,
        connection
      );
    }
    
    return passengerId;
  };

  /**
   * Create a passenger info object from application data
   */
  const createPassengerInfoFromApplicationData = (applicationData: any): RepoPassengerData => {
    return {
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
  };
  
  /**
   * Create a new passenger with the provided information
   */
  const createNewPassenger = async (
    personalInfo: PersonalInfo,
    passportInfo: PassportInfo,
    addressInfo: AddressInfo,
    userId: number,
    connection: any
  ): Promise<number> => {
    const passengerData: any = {
      first_name: personalInfo.first_name,
      last_name: personalInfo.last_name,
      email: personalInfo.email_id,
      dob: personalInfo.date_of_birth,
      processing_branch: personalInfo.processing_branch,
      passport_number: passportInfo.passport_number,
      passport_date_of_issue: passportInfo.date_of_issue,
      passport_date_of_expiry: passportInfo.date_of_expiry,
      passport_issue_at: passportInfo.issue_at,
      count_of_expired_passport: passportInfo.no_of_expired_passport,
      expired_passport_number: passportInfo.expired_passport_number,
      address_line_1: addressInfo.address_line1,
      address_line_2: addressInfo.address_line2 || '',
      country: addressInfo.country,
      state: addressInfo.state,
      city: addressInfo.city,
      zip: addressInfo.zip,
      occupation: addressInfo.occupation,
      position: addressInfo.position,
      last_updated_by: userId,
      status: constants.STATUS.PASSENGER.ACTIVE // Assume default active status
    };
    
    const result = await passengerRepository.insertPassengerWithConnection(passengerData, connection);
    return result.data.insertId;
  };
  
  /**
   * Update the primary application with travel and visa information
   */
  const updatePrimaryApplication = async (
    applicationId: number,
    travelInfo: any,
    visaRequest: any,
    miFields: any,
    connection: any
  ): Promise<void> => {
    const applicationUpdateData = {
      id: applicationId,
      travel_date: travelInfo.travel_date,
      interview_date: travelInfo.interview_date,
      file_number_1: travelInfo.file_no,
      is_travel_date_tentative: travelInfo.is_travel_date_tentative,
      priority_submission: travelInfo.priority_submission,
      visa_country: visaRequest.visa_country,
      visa_category: visaRequest.visa_category,
      nationality: visaRequest.nationality,
      state_id: visaRequest.state,
      entry_type: visaRequest.entry_type,
      remarks: visaRequest.remark || '',
      olvt_number: miFields?.olvt_number,
      external_status: APPLICATION_EXTERNAL_STATUS.IN_TRANSIT,
      queue: APPLICATION_QUEUES.IN_TRANSIT,
      status: constants.STATUS.APPLICATION.STEP3_DONE
    };
    
    await applicationRepository.updateStep3Data(applicationUpdateData, connection);
  };
  
  /**
   * Process additional visa requests by creating new applications
   */
  const processAdditionalVisaRequests = async (
    applicationData: any,
    travelInfo: any,
    additionalVisaRequests: any[],
    passengerId: number,
    miFields: any,
    userId: number,
    connection: any
  ): Promise<void> => {
    try {
      // Start a new transaction for additional visa requests
      await connection.beginTransaction();
      
      // Create application data for batch insert
      const additionalApplicationsData = additionalVisaRequests.map(visaRequest => ({
        client_user_id: applicationData.client_user_id,
        pax_type: applicationData.pax_type,
        country_of_residence: applicationData.country_of_residence,
        state_of_residence: applicationData.state_of_residence, 
        citizenship: applicationData.citizenship,
        service_type: applicationData.service_type,
        referrer: applicationData.referrer,
        file_number_1: travelInfo.file_no,
        travel_date: travelInfo.travel_date,
        interview_date: travelInfo.interview_date,
        is_travel_date_tentative: travelInfo.is_travel_date_tentative,
        priority_submission: travelInfo.priority_submission,
        reference_number: applicationData.reference_number,
        visa_country: visaRequest.visa_country,
        visa_category: visaRequest.visa_category,
        nationality: visaRequest.nationality,
        state_id: visaRequest.state,
        entry_type: visaRequest.entry_type,
        remarks: visaRequest.remark || '',
        olvt_number: miFields?.olvt_number,
        external_status: APPLICATION_EXTERNAL_STATUS.IN_TRANSIT,
        queue: APPLICATION_QUEUES.IN_TRANSIT,
        status: constants.STATUS.APPLICATION.STEP3_DONE,
        last_updated_by: userId
      }));
      
      // Create batch applications
      if (additionalApplicationsData.length > 0) {
        const result = await applicationRepository.batchInsertApplications(
          additionalApplicationsData, 
          connection
        );
        
        // If batch insert was successful, create mappings
        if (result.status && result.data && result.data.insertId) {
          const firstInsertId = result.data.insertId;
          const applicationIds = [];
          
          for (let i = 0; i < additionalApplicationsData.length; i++) {
            applicationIds.push(firstInsertId + i);
          }
          
          // Create batch mappings
          await applicationPassengerRepository.batchCreateMappings(
            applicationIds,
            passengerId,
            userId,
            connection
          );
        }
      }
      
      // Commit the transaction
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
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
