const { logger } = require('../logging');
const _ = require("underscore");
const mysql = require("mysql");
const dbConfig = require("../config/mysqlConfig");
envDBConfig = dbConfig["dev"]

var mysqlConnection = mysql.createPool({
  host: envDBConfig.HOST,
  user: envDBConfig.USER,
  password: envDBConfig.PASSWORD,
  database: envDBConfig.DB,
  connectionLimit: envDBConfig.max,  // Maximum connections
  waitForConnections: true,  // Makes sure requests wait for available connections
  queueLimit: 0,  // No limit on queued connections
  acquireTimeout: envDBConfig.acquire,  // Timeout before throwing error
  idleTimeoutMillis: envDBConfig.idle,  // How long a connection remains idle before being closed
  minConnections: envDBConfig.min, // Minimum number of connections
});


class Mysql {
    constructor(pool) {
        this.pool = pool;
    }

    generateErrorResponse(err) {
        let result = {};
        result.status = false;
        result.code = err.code;
        result.message = err.message;
        logger.error(`in connection Postgres err - ${JSON.stringify(result)} \nfor sql - ${err.sql}`);
        return result;
    }

    generateSuccessResponse(data) {
        let result = {};
        switch (data.command) {
            case "INSERT":
                result.insertId = data.rows.length > 0 ? _.values(data.rows[data.rows.length-1])[0] : null;
                result.affectedRows = data.rowCount;
                break;
            case "UPDATE":
                result.affectedRows = data.rowCount;
                result.rows = data.rows;
                break;
            default:
                result = data.rows;
        }
        return {status: true, data: result};
    }

    async getConnection(db=databases.ENERGY) {
        let connection = await this.pool.connect();
        return new Connection(this.pool, connection);
    }

    addReturnIdInInsertQuery(query) {
        if(/^insert/i.test(query) && !/RETURNING/i.test(query)) {
            query += ` RETURNING id`;
        }
        return query;
    }

    async query(query, params) {
        try {
            let counter = 0;
            query = query.replace(/[?]/g, function(){return `$${++counter}`});
            query = this.addReturnIdInInsertQuery(query);
            if(query !== "SELECT 1 p") {
                logger.info('Postgres query - ' + query);
                logger.info('Postgres params - ' + params);
            }
            let data = await this.pool.query(query, params);
            const response = this.generateSuccessResponse(data)
            logger.info(`Query Resp: ${JSON.stringify(response)}`);
            return response;
        } catch (err) {
            return Promise.reject(this.generateErrorResponse(err));
        }
    }
}

class Connection extends Mysql{
    constructor(pool, connection) {
        super(pool);
        this.connection = connection;
    }

    async query(query, params) {
        try {
            let counter = 0;
            query = query.replace(/[?]/g, function(){return `$${++counter}`});
            query = this.addReturnIdInInsertQuery(query);
            if(query !== "SELECT 1 p") {
                logger.info('Postgres query - ' + query);
                logger.info('Postgres params - ' + params);
            }
            let data = await this.connection.query(query, params);
            return this.generateSuccessResponse(data);
        } catch (err) {
            return Promise.reject(this.generateErrorResponse(err));
        }
    }

    async beginTransaction() {
        return this.query('START TRANSACTION');
    }

    async commit() {
        return this.query('COMMIT');
    }

    async rollback() {
        return this.query('ROLLBACK');
    }

    release() {
        this.connection && this.connection._connected && this.connection.release();
    }
}

const mysqlDB = new Mysql(mysqlConnection);
Object.freeze(mysqlDB);

module.exports = mysqlDB;
