module.exports = {
    TABLES :{
        ROLE: "role",
        ROLE_HISTORY: "role_history",
        USER: "user",
        USER_HISTORY: "user_history",
        APPLICATION: "application",
        APPLICATION_HISTORY: "application_history",
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
    },

    USER_TABLE:{
        TYPE: {
            DEFAULT: 0,
            ADMIN: 1,
            MANAGER: 2,
            CLIENT: 3,
            VISA_APPLIER: 4, // Not in use
        }
    },

    ROLE_TABLE:{
        TYPE: {
            APPLICATION: 1,
            USER: 2,
        },
        SUBTYPE: {
            SELF: 1,
            ALL: 2,
        }
    },

    ADMIN_API_SUPERPASS: "admin567",

}