// const constants = require('../config/constants');
// const utility = require('../services/utility')()
// const {logger} = require('../logging');
// const Mysql = require('../database/mySqlConnection')

// module.exports = () => {
//     const insertRole = async(data) => {
//         try{
//             let query = `insert into ${constants.TABLES.ROLE} 
//             (user_id, type, sub_type, operations, status, last_change_by) values (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE operations = VALUES(operations), last_change_by = VALUES(last_change_by);`

//             let params = [data.user_id, data.type, data.sub_type, data.operations, data.status, data.last_change_by]
//             const resp = await Mysql.query(query, params);
//             if (resp.data.affectedRows) {
//                 // todo confirm of insertId in case of update
//               await insertRoleHistory(resp.data.insertId);
//           }

//             return null;
//         }catch(e){
//             logger.error(`Error in insertRole : ${utility.generateError(e)}`)
//             throw e
//         }
//     }

//     const insertRoleHistory = async (id) => {
//         try{
//             let query = `insert into ${constants.TABLES.ROLE_HISTORY} 
//                             (role_id, user_id, type, sub_type, operations, status, last_change_by) select id, user_id, type, sub_type, operations, status, last_change_by
//                             from ${constants.TABLES.USER} where id = ?`
//             let params = [id];
//             return (await PostgreSql.query(query,params));
//         }catch(e){
//             logger.error(`Error in insertRoleHistory : ${utility.generateError(e)}`)
//             throw e
//         }
//     }

//     const getRolebyUserId = async (userId) => {

//         try {
//             const query = `select * from ${constants.TABLES.USER} where user_id = '${userId}'`
//             const resp = await PostgreSql.query(query);
            
//             return resp.data;

//         } catch (e) {
//             logger.error(`getRolebyUserId error response : ${generateError(e)}`);
//             throw e;
//         }
//     }

//     const getOperationsByUserIdTyper = async (userId, type, subType) => {

//         try {
//             const query = `select * from ${constants.TABLES.USER} where user_id = '${userId}' and type = ? and sub_type = ?`
//             const resp = await PostgreSql.query(query, [type, subType]);
            
//             return resp.data;

//         } catch (e) {
//             logger.error(`getOperationsByUserIdTyper error response : ${generateError(e)}`);
//             throw e;
//         }
//     }

//     return {
//         insertRole,
//       getRolebyUserId,
//       getOperationsByUserIdTyper,
//     }
// }