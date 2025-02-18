const constants = require('../config/constants');
const utility = require('../services/util')()
const {logger} = require('../logging');
const Mysql = require('../database/mySqlConnection')

module.exports = () => {
    const create = async(data) => {
        try{
            let query = `insert into ${constants.TABLES.application} 
            (name, phone, email, password, address, poc, status, last_updated_by, type) values (?,?)`

            let params = [data.name, data.phone, data.email, data.password, data.address, data.poc, constants.STATUS.application.ACTIVE, data.last_updated_by, data.type]
            const resp = await Mysql.query(query, params);
            if (resp.data.insertId) {
              await insertHistory(resp.data.insertId);
          }

            return null;
        }catch(e){
            logger.error(`Error in insertapplication : ${utility.generateError(e)}`)
            throw e
        }
    }

    const insertHistory = async (id) => {
        try{
            let query = `insert into ${constants.TABLES.application_HISTORY} 
                            (application_id, name, phone, email, password, address, poc, status, last_updated_by, type) select application_id, name, phone, email, password, address, poc, status, last_updated_by, type
                            from ${constants.TABLES.application} where id = ?`
            let params = [id];
            return (await PostgreSql.query(query,params));
        }catch(e){
            logger.error(`Error in insertapplicationHistory : ${utility.generateError(e)}`)
            throw e
        }
    }

    const addDetails = async(data) => {
        try{
            let query = `update ${constants.TABLES.application} set name = ?, phone = ?, address = ?, poc = ?, status = ?, last_updated_by = ?, type = ?
            where uuid  ?`

            let params = [data.name, data.phone, data.address, data.poc, data.status, data.last_updated_by, data.type]
            const resp = await Mysql.query(query, params);
            if (resp.data.insertId) {
              await insertapplicationHistory(resp.data.insertId);
          }

            return null;
        }catch(e){
            logger.error(`Error in addDetails : ${utility.generateError(e)}`)
            throw e
        }
    }

    const getApplicationByID = async (id) => {

        try {
            const query = `select * from ${constants.TABLES.application} where id = ${id} and status = ${constants.STATUS.application.ACTIVE}`
            const resp = await PostgreSql.query(query);
            
            if (resp.data && resp.data.length) return resp.data[0];
            return null;

        } catch (e) {
            logger.error(`getApplicationByID error response : ${generateError(e)}`);
            throw e;
        }
    }

    const search = async (text) => {

        try {
            const query = `select * from ${constants.TABLES.application} where email like '%${text}%' order by id desc`
            const resp = await PostgreSql.query(query);
            
            if (resp.data && resp.data.length) return resp.data;
            return null;

        } catch (e) {
            logger.error(`search error response : ${generateError(e)}`);
            throw e;
        }
    }

    const updateDocuments = async (applicationId) => {

        try{
            let query = `update ${constants.TABLES.application} set last_login_at = ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')} where id = ?`

            let params = [applicationId]
            const resp = await Mysql.query(query, params);
            if (resp.data.insertId) {
              await insertapplicationHistory(resp.data.insertId);
          }

            return null;
        }catch(e){
            logger.error(`Error in updateapplicationLastLoginAt : ${utility.generateError(e)}`)
            throw e
        }
    }

    const updateApplicationStatus = async (applicationId) => {

        try{
            let query = `update ${constants.TABLES.application} set last_login_at = ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')} where id = ?`

            let params = [applicationId]
            const resp = await Mysql.query(query, params);
            if (resp.data.insertId) {
              await insertapplicationHistory(resp.data.insertId);
          }

            return null;
        }catch(e){
            logger.error(`Error in updateApplicationStatus : ${utility.generateError(e)}`)
            throw e
        }
    }

    return {
      create,
      addDetails,
      getApplicationByID,
      updateDocuments,
      updateApplicationStatus,
      search,
    }
}