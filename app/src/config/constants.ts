const constants = {
  TABLES: {
    ROLE: "role",
    ROLE_HISTORY: "role_history",
    USER: "users",
    USER_HISTORY: "users_history",
    APPLICATION: "applications",
    APPLICATION_HISTORY: "applications_history",
    CLIENT: "clients",
    CLIENT_HISTORY: "clients_history",
    PASSENGER: "passengers",
    PASSENGER_HISTORY: "passengers_history",
    APPLICATION_PASSENGER_MAPPING: "application_passenger_mapping",
    APPLICATION_PASSENGER_MAPPING_HISTORY:
      "application_passenger_mapping_history",
  },

  STATUS: {
    ROLE: {
      ACTIVE: 1,
      INACTIVE: 2,
    },
    USER: {
      ACTIVE: 1,
      INACTIVE: 2,
    },
    APPLICATION: {
      STEP1_DONE: 1,
      STEP2_DONE: 2,
      STEP3_DONE: 2,
      STEP4_DONE: 2,
    },
    PASSENGER: {
      ACTIVE: 1,
      INACTIVE: 2,
      DELETED: 3,
    },
    APPLICATION_PASSENGER_MAPPING: {
      ACTIVE: 1,
      INACTIVE: 2,
    },
  },

  USER_TABLE: {
    TYPE: {
      DEFAULT: 0,
      ADMIN: 1,
      MANAGER: 2,
      CLIENT: 3,
      VISA_APPLIER: 4, // Not in use
    },
    NEW_PASSWORD_REQUEST: {
      NOT_REQUESTED: 0,
      REQUESTED: 1,
    },
    PASSWORD_REQUESTED: {
      NO: 0,
      YES: 1,
    },
  },
  CLIENTS_TABLE: {
    TYPE: {
      DEFAULT: 0,
      AGENT: 1,
      CORPORATE: 2,
    },
  },

  ROLE_TABLE: {
    TYPE: {
      APPLICATION: 1,
      USER: 2,
    },
    SUBTYPE: {
      SELF: 1,
      ALL: 2,
    },
  },

  ADMIN_API_SUPERPASS: "admin567",

  SIGN_IN_STATUS_TYPE: {
    SUCCESS: 1,
    INCORRECT_PASSWORD: 2,
    EXPIRED_REQUEST_NOT_INITIATED: 3,
    EXPIRED_REQUEST_INITIATED: 4,
    INACTIVE_BY_ADMIN: 5,
    EMAIL_NOT_FOUND: 6,
  },

  SIGN_IN_STATUS_MESSAGE: {
    SUCCESS: "",
    INCORRECT_PASSWORD: "Incorrect password please try again.",
    EXPIRED_REQUEST_NOT_INITIATED:
      "Your password has expired. Request a new password to continue.",
    EXPIRED_REQUEST_INITIATED:
      "Your password reset request has been sent successfully.",
    INACTIVE_BY_ADMIN:
      "Your password has expired. Request a new password to continue.",
    EMAIL_NOT_FOUND: "Email does not exist.",
  },
};

export default constants;
