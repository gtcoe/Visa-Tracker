import constants from "../config/constants";
import { logger } from "../logging";
import Response from "../models/response";
import { generateError, generateRandomString } from "../services/util";
import ApplicationRepository, {
  ApplicationData,
  GetApplicationDataDBResponse,
} from "../repositories/application";
import userRepositoryFactory, {
  UserData,
  GetUserDataDBResponse,
} from "../repositories/user";

import passengerRepositoryFactory, {
  PassengerData,
  GetPassengerDataDBResponse,
} from "../repositories/passenger";
import applicationPassengerRepositoryFactory, {
  ApplicationPassengerMappingData,
  GetApplicationPassengerMappingDataDBResponse,
} from "../repositories/applicationPassengerMapping";
import { AddStep1DataRequest } from "../models/Application/addStep1DataRequest";
import { AddStep2DataRequest } from "../models/Application/addStep2DataRequest";
import { AddStep3DataRequest } from "../models/Application/addStep3DataRequest";
import { AddStep4DataRequest } from "../models/Application/addStep4DataRequest";
import { SearchPaxRequest } from "../models/Application/searchPax";
import { SearchRequest } from "../models/Application/tracker";

const applicationService = () => {
  const applicationRepository = ApplicationRepository();
  const userRepository = userRepositoryFactory();
  const passengerRepository = passengerRepositoryFactory();
  const applicationPassengerRepository =
    applicationPassengerRepositoryFactory();

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

      const passengerInfo: PassengerData | null = passengerResponse.data
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
        await applicationRepository.getByReferenceNumber(
          request.reference_number
        );

      // Error Fetching passengerInfo
      if (!applicationResponse || !applicationResponse.status) {
        throw new Error(
          `unable to fetch application info by reference_number: ${request.reference_number}`
        );
      }

      const applicationInfo: ApplicationData | null = applicationResponse.data
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

        const applicationsInfo: ApplicationData[] = applicationResponse.data
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
      const mappingInfo: PassengerData[] = passengerResponse.data
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

      const applicationInfo: ApplicationData | null = applicationResponse.data
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

  const addStep3Data = async (request: AddStep4DataRequest): Promise<any> => {
    const response = new Response(false);
    try {
      response.setStatus(true);
      return response;
    } catch (e) {
      logger.error(
        `error in applicationService.addStep3Data - ${generateError(e)}`
      );
      throw e;
    }
  };

  return {
    addStep1Data,
    addStep2Data,
    searchPax,
    addStep4Data,
    search,
    addStep3Data,
  };
};

export default applicationService;
