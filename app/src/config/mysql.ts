interface DbConfig {
    HOST: string;
    USER: string;
    PASSWORD: string;
    DB: string;
    port: number | string;
    max: number;
    min: number;
    acquire: number;
    idle: number;
  }
  
  const MySqlConfig: { dev: DbConfig; prod: DbConfig } = {
    dev: {
      HOST: "127.0.0.1",
      USER: "root",
      PASSWORD: "gungun1459",
      DB: "a",
      port: 3306,
      max: 50,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    prod: {
      HOST: process.env.MYSQL_HOST || "",
      USER: process.env.ENERGY_SERVICES_USER || "",
      PASSWORD: process.env.ENERGY_SERVICES_PASSWORD || "",
      DB: process.env.ENERGY_SERVICES_DB || "",
      port: process.env.MYSQL_PORT || 3306,
      max: 50,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };
  
  export default MySqlConfig;
  