
import * as dotenv from "dotenv";
import { AppConstants } from "./smartup_framework/framework/constants/constants";
// import { AppConstants } from "./framework/constants/constants";

var request = require("request")
require('dotenv').config()


module.exports = function configuration(req:any,res:any,next:any){
    let ac = new AppConstants();
    let referer = process.env.REFERER;
    console.log("referer   "+ referer);
    let authorization_token_with_bearer = req.headers['Authorization'] ==null? req.headers['authorization'] : req.headers['Authorization'];

    console.log("inside configuration middleware 2")
    var configHeaders = {
        'Referer':referer,
        'Content-Type':process.env.CONTENT_TYPE,
        'Authorization' : authorization_token_with_bearer
    };
    const configUri = process.env.CONFIGURATION_URL;
    // console.log("url     "+ process.env.PLATFORM_CLAIM_URL);
    var options = {
        url: configUri,
        headers : configHeaders
    };

    request(options,(error:any,res:any,body:any)=>{
        if(res.statusCode==200){
            // const authority = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Nl7rkrtXL";
            const data = JSON.parse(body);
            // console.log("body "+ data);
            const authority = data.authority;
            // console.log("authority    "+authority+ " body authority   "+ data.authority);
            req.authority = authority;
            // console.log("req authority   "+req.authority);
            next();
        }
    })

}



// import * as dotenv from "dotenv";
// import { AppConstants } from "./framework/constants/appConstants";

// var request = require("request")
// require('dotenv').config()


// module.exports = function configuration(req:any,res:any,next:any){
//     let ac = new AppConstants();
//     let referrer = req[ac.REFERER];
//     let authorization_token_with_bearer = req.headers['Authorization'] ==null? req.headers['authorization'] : req.headers['Authorization'];

//     //'Content-Type' : process.env.CONTENT_TYPE
//     console.log("inside configuration middleware 2")
//     var configHeaders = {
//         'Referer':referrer,
//         'Content-Type':process.env.CONTENT_TYPE,
//         'Authorization' : authorization_token_with_bearer
//     };

//     const configUri = process.env.CONFIGURATION_URL;
//     var options = {
//         url: configUri,
//         headers : configHeaders
//     };

//     request(options,(error:any,res:any,body:any)=>{
//             if(!error && res.statusCode==200){
//                 console.log("inside request");
//                 const data = JSON.parse(body);
//                 const authority = data.authority;
//                 // const authority = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Nl7rkrtXL";
//                 // req['configuration']['authority'] = authority;
//                 req.authority = authority;
//                 console.log(authority);
//                 next();
//         }
//     })
// }

