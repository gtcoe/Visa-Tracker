const nodeCache = require("node-cache");
const config = require("../config");
// const dbQueryService = require('./dbQueryService');
// const { logger } = require('../../logging');
// const { generateError} = require('./utilServices')();
// const constants = config.constants;
// const Response = require('../../models/response')
const _ = require("underscore");

class NodeCache {
    constructor() {
        this._cache = new nodeCache()
    }

    get cache(){
        return this._cache;
    }

    // async getBatteryIdFromVendorBatteryId(vendorBatteryId){
    //     try{
    //         let batteryId = this._cache.get(vendorBatteryId);
    //         if(!batteryId){
    //             let query = `select id, vendor_battery_id from ${constants.DB_TABLES.BATTERY} `
    //             let resp = await dbQueryService.executeQuery(query);
    //             for(let i = 0;i<resp.data.length;i++){
    //                 let { id, vendor_battery_id } = resp.data[i];
    //                 vendor_battery_id && this._cache.set(vendor_battery_id,id,86400) // cache for 24 hours
    //             }
    //             return (this._cache.get(vendorBatteryId));
    //         }
    //         return batteryId;
    //     } catch(e){
    //         logger.error(`Error in fetching batteryId :: ${ generateError(e) }`)
    //     }
    // }

    // async getDistanceFactor(vendorCode){
    //     let response = new Response(false);
    //     try{
    //         let distanceFactor = this._cache.get(`distanceFactor_${vendorCode}`);
    //         if(!distanceFactor){
    //             let resp = await dbQueryService.select(constants.DB_TABLES.VENDOR,['name','distance_factor'], {vendor_type: constants.VENDOR_TYPE.BATTERY, state: constants.VENDOR_STATE.ACTIVE});
    //             if(!resp.status){
    //                 logger.warn(`Error fetching vendor data from DB: ${JSON.stringify(resp)}`)
    //                 response.message = resp.message ? resp.message : config.errorMessages.ERROR_GETTING_DATA_FROM_DB;
    //                 return response
    //             }
    //             for(let i = 0; i < resp.data.length; i++){
    //                 let { name, distance_factor } = resp.data[i];
    //                 const vendorCode = constants.VENDOR_NAME_TO_CODE_MAPPING[name];
    //                 if(distance_factor){
    //                      this._cache.set(`distanceFactor_${vendorCode}`,distance_factor,86400) // cache for 24 hours
    //                 }
    //             }
    //             distanceFactor = this._cache.get(`distanceFactor_${vendorCode}`);
    //         }
    //         logger.info(`Distance Factor for Vendor Code: ${vendorCode} is ${distanceFactor}`)
    //         response.setStatus(true);
    //         response.data = {
    //             distanceFactor
    //         }
    //     } catch(e){
    //         logger.error(`Error in fetching distanceFactor :: ${ generateError(e) }`)
    //     }
    //     return response
    // }
}

module.exports = new NodeCache();