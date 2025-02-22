const constants = require("../config/constants");
const utility = require("../services/util")();
const { logger } = require("../logging");
const Mysql = require("../database/mySqlConnection");
const moment = require("moment");

module.exports = () => {
  const insertUser = async (data) => {
    try {
      let query = `insert into ${constants.TABLES.USER} 
            (name, email, password, status, type, password_valid_till, last_updated_by) values (?,?, ?, ? ,? ,? ,?)`;

      let params = [
        data.namee,
        data.email,
        data.password,
        data.status,
        data.type,
        data.password_valid_till,
        data.last_updated_by,
      ];
      const resp = await Mysql.query(query, params);
      if (resp.data.insertId) {
        await insertUserHistory(resp.data.insertId);
      }

      return null;
    } catch (e) {
      logger.error(`Error in insertUser : ${utility.generateError(e)}`);
      throw e;
    }
  };

  const insertUserHistory = async (id) => {
    try {
      let query = `insert into ${constants.TABLES.USER_HISTORY} 
                            (user_id, name, phone, email, password, address, poc, status, last_updated_by, type) select user_id, name, phone, email, password, address, poc, status, last_updated_by, type
                            from ${constants.TABLES.USER} where id = ?`;
      let params = [id];
      return await PostgreSql.query(query, params);
    } catch (e) {
      logger.error(`Error in insertUserHistory : ${utility.generateError(e)}`);
      throw e;
    }
  };

  const update = async (data) => {
    try {
      let query = `update ${constants.TABLES.USER} set name = ?, phone = ?, address = ?, poc = ?, status = ?, last_updated_by = ?, type = ?
            where uuid  ?`;

      let params = [
        data.name,
        data.phone,
        data.address,
        data.poc,
        data.status,
        data.last_updated_by,
        data.type,
      ];
      const resp = await Mysql.query(query, params);
      if (resp.data.insertId) {
        await insertUserHistory(resp.data.insertId);
      }

      return null;
    } catch (e) {
      logger.error(`Error in updateUser : ${utility.generateError(e)}`);
      throw e;
    }
  };

  //done
  const updateStatusAndPassword = async (
    status,
    password,
    userId,
    lastUpdatedBy,
    passwordValidTill
  ) => {
    try {
      let query = `update ${constants.TABLES.USER} set status = ?, password = ?, password_valid_till = '${passwordValidTill}', last_updated_by = ? 
            where id = ?`;

      let params = [status, password, lastUpdatedBy, userId];
      const resp = await Mysql.query(query, params);
      if (resp.data.insertId) {
        await insertUserHistory(resp.data.insertId);
      }

      return null;
    } catch (e) {
      logger.error(
        `Error in updateStatusAndPassword : ${utility.generateError(e)}`
      );
      throw e;
    }
  };

  const getUserByID = async (id) => {
    try {
      const query = `select * from ${constants.TABLES.USER} where id = ${id} and status = ${constants.STATUS.USER.ACTIVE}`;
      const resp = await PostgreSql.query(query);

      if (resp.data && resp.data.length) return resp.data[0];
      return null;
    } catch (e) {
      logger.error(`getUserByID error response : ${generateError(e)}`);
      throw e;
    }
  };

  const getUserByEmail = async (email) => {
    try {
      const query = `select * from ${constants.TABLES.USER} where email = '${email}' order by id desc limit 1`;
      const resp = await PostgreSql.query(query);

      if (resp.data && resp.data.length) return resp.data[0];
      return null;
    } catch (e) {
      logger.error(`getUserByEmail error response : ${generateError(e)}`);
      throw e;
    }
  };

  //done
  const search = async (text) => {
    try {
      const query = `select * from ${constants.TABLES.USER} where email like '%${text}%' order by id desc`;
      const resp = await PostgreSql.query(query);

      if (resp.data && resp.data.length) return resp.data;
      return null;
    } catch (e) {
      logger.error(`search error response : ${generateError(e)}`);
      throw e;
    }
  };

  const updateAfterSuccessfullLogin = async (userId) => {
    const currentTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const expiryTime = moment(new Date())
      .add(30, "days")
      .format("YYYY-MM-DD HH:mm:ss");

    try {
      let query = `update ${constants.TABLES.USER} set 
                            last_login_at = '${currentTime}',
                            password_valid_till = '${expiryTime}' 
                        where id = ?`;

      let params = [userId];
      const resp = await Mysql.query(query, params);
      if (resp.data.insertId) {
        await insertUserHistory(resp.data.insertId);
      }

      return null;
    } catch (e) {
      logger.error(
        `Error in updateUserLastLoginAt : ${utility.generateError(e)}`
      );
      throw e;
    }
  };

  //done
  const getUsersByType = async (type) => {
    try {
      const query = `select * from ${constants.TABLES.USER} where type = '${type}' and status = ${constants.STATUS.USER.ACTIVE} order by id desc`;
      const resp = await PostgreSql.query(query);

      if (resp.data && resp.data.length) return resp.data;
      return null;
    } catch (e) {
      logger.error(`getUsersByType error response : ${generateError(e)}`);
      throw e;
    }
  };

  return {
    insertUser,
    update,
    getUserByID,
    getUserByEmail,
    updateAfterSuccessfullLogin,
    getUsersByType,
    updateStatusAndPassword,
    search,
  };
};
