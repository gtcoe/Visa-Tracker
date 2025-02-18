const MySqlConfig = {
    dev: {
        HOST : "127.0.0.1",
        USER : "root",
        PASSWORD : "gungun1459",
        DB : "a",
        port : 3306,
        max : 50,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    prod:{
        HOST : process.env.MYSQL_HOST,
        USER : process.env.ENERGY_SERVICES_USER,
        PASSWORD : process.env.ENERGY_SERVICES_PASSWORD,
        DB : process.env.ENERGY_SERVICES_DB,
        port : process.env.MYSQL_PORT,
        max : 50,
        min: 0,
    acquire: 30000,
    idle: 10000
    }
};
module.exports = MySqlConfig;
