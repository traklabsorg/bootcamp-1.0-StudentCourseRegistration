
// // module.exports = function authenticationToken(req:any,res:any,next:any){
// //     console.log("authentication middleware worked");
// //     next();
// // }
// var jwt = require('jsonwebtoken');
// var url = require("url");
// var request = require("request");
// require('dotenv').config()

// async function requester(options:any){

//     return await request(options, (error:any,response:any,body:any)=>{
//         if(!error && response.statusCode==200){
//             return body;
//         }
//         else {
//             throw new Error("Something went wrong");
//         }
//     })
// }

// module.exports = function authenticateToken(req:any, res:any, next:any) {

//     const constants = {
//         MISSING_JWT : "Missing jwt",
//         INVALID_JWT : "Invalid jwt"
//     }

//     // let token = req.headers.authorization;
//     // let token = "eyJraWQiOiJkSWRnWGZMYUdNSlwvSFFHdkNtN3ZRMGNnemlrdUhMd2tqSHR3aDFTY092RT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3Yjg2ZTVmOC1lMWMxLTQwMjAtOWNiZC1kNmMwYzYwMTJlODIiLCJldmVudF9pZCI6Ijc0MmI0Y2ZlLWI1YmQtNGM1Yy04YjlhLTVhYjlkNzZlNmUyZiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE1OTkxMzM4OTEsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05sN3JrcnRYTCIsImV4cCI6MTU5OTEzNzQ5MSwiaWF0IjoxNTk5MTMzODkxLCJ2ZXJzaW9uIjoyLCJqdGkiOiJkZWI5OGNkYy04OGRiLTQ1ZDAtYTY0Zi04NGQxZTk4Y2VkYTYiLCJjbGllbnRfaWQiOiI3NXQzN25sc2JyZ3Vmc2VranJrazdnOGU5MyIsInVzZXJuYW1lIjoiYWF5dXNoIn0.r0W2lUtHzoBZAX-Daw4sbcyNg6VF2RZ5EV5jH5PkszVti3oCb8WS1S12GsgaDc1ujt_9Z89w5lnxzM8DkQBJRpnRc4BTfzTs21tt_0XHPB4MVUtq0SlIN6UeV0iXaySLoJgOkgks9J7UetBbHwSQRvoMEU_drjjpXnmPwT6gmRKnGWv3afpaBfsWnOaH9RwQyqTvk_CyKqPucn74d9fDPCe_iYjaBBp_42Z9_dzweMMRfCOqLwxw_1qogFdc6lanW-KB2Xtl81SBpLEsWGI4lFHO6b-G3hLRJf7kHtXMDlENMXGD9zMn1x2csYtkxXOTbgPUta7nSToKN3RvDu43_w";
    
//     let token = req.headers["Authorization"];
//     if (token === null || !token) {
//         // return customError.sendError(res, 401, constants.MISSING_JWT);
//         //some constants to return message for un-authorized
//         res.status(400).send(constants.MISSING_JWT);
//     } else {

//         // token = token.replace(/^Bearer /, '');
//         const decodedJwt = jwt.decode(token, { complete: true });
//         // you need jwt library
//         // console.log("hello1 " + decodedJwt.payload.iss);
//         if (decodedJwt === null) {
//             // return customError.sendError(res, 401, constants.INVALID_JWT);
//             //SOME METHOD THAT RETURN RESPONSE 401 and DOES SOME LOGGING
//             res.status(400).send(constants.INVALID_JWT);
//         }
//         try {
//             const new_url = url.parse(decodedJwt.payload.iss);
//             // console.log("new_url host  "+ new_url.host);
//             //Provided conrete values for now, later will loaded from request
//             if (new_url.host === "cognito-idp.us-east-1.amazonaws.com") {
//                 // const curr_token = "Bearer "+ token;
// //********* THE BELOW METHOD WILL JUST VALIDATE THE TOKEN AGAINST THE //IDENITITY PROVIDER, IN OUR CASE ITS AWS THAT WILL BE EVALUATED FROM
// //  req['Configuration']  *********

//                 // console.log(token);
//                 // console.log(req.authority);
//                 // console.log("check validity "+checkTokenValidity("Bearer "+token,  req.authority));
//                 checkValid();
//                 // @ts-ignore
//                 function checkValid(){

//                     var result = checkTokenValidity("Bearer "+token,  req.authority);
//                     console.log("result "+ result);
//                     if(result){
//                         console.log("isValid Token");
//                         // req.data = result;
//                         //IF NEGETIVE THEN JUST SEND RESPONSE 401 (Un-Authorized)
//                         next();
//                     }
//                     else{
//                         console.log("not valid token");
//                         res.status(401).send("Token not valid");
//                     }
//                 }
//             }
//         } catch (e) {
//             // return customError.sendError(res, 401, constants.INVALID_JWT);
//             res.status(400).send("error");
//         }
//     }
// }

// function checkTokenValidity(token:any, authority:any) {
//     // var isTokenValid = false;
//     // console.log("hello2");
//     //MAKE A CALL TO " https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Nl7rkrtXL/.well-known/openid-configuration "
//     const Authentication_uri = authority + "/.well-known/openid-configuration";
//     // console.log("Authentication uri    " + Authentication_uri);
//     var isTokenValid = false;

//     var result = requester(Authentication_uri)
//         .then((res) => {
//             const data = JSON.parse(res);
//             const user_uri = data.userinfo_endpoint;

//             const aHeaders = {
//                 "Authorization": token
//             }
//             const options = {
//                 url: user_uri,
//                 headers: aHeaders
//             };

//             return options;
//         })
//         .then((options) => {
//             requester(options)
//                 .then((res) => {
//                     if (res) {
//                         isTokenValid = true;
//                     }
//                 })
//             return isTokenValid;
//         })
//         .catch((error) => {
//             // console.log("error " + error);
//             throw new Error("invalid token");
//         })

//     return result;
// }


// module.exports = function authenticationToken(req:any,res:any,next:any){
//     console.log("authentication middleware worked");
//     next();
// }
var jwt = require('jsonwebtoken');
var url = require("url");
var request = require("request");
require('dotenv').config()

async function requester(options:any){

    return await request(options, (error:any,response:any,body:any)=>{
        if(!error && response.statusCode==200){
            return body;
        }
        else {
            throw new Error("Something went wrong");
        }
    })
}

module.exports = function authenticateToken(req:any, res:any, next:any) {

    // console.log("route method " + req.route.stack[0].method);

    const constants = {
        MISSING_JWT : "Missing jwt",
        INVALID_JWT : "Invalid jwt"
    }

    console.log("authority  in authentication   " + req.authority);

    // let token = "eyJraWQiOiJkSWRnWGZMYUdNSlwvSFFHdkNtN3ZRMGNnemlrdUhMd2tqSHR3aDFTY092RT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3Yjg2ZTVmOC1lMWMxLTQwMjAtOWNiZC1kNmMwYzYwMTJlODIiLCJldmVudF9pZCI6Ijc0MmI0Y2ZlLWI1YmQtNGM1Yy04YjlhLTVhYjlkNzZlNmUyZiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE1OTkxMzM4OTEsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX05sN3JrcnRYTCIsImV4cCI6MTU5OTEzNzQ5MSwiaWF0IjoxNTk5MTMzODkxLCJ2ZXJzaW9uIjoyLCJqdGkiOiJkZWI5OGNkYy04OGRiLTQ1ZDAtYTY0Zi04NGQxZTk4Y2VkYTYiLCJjbGllbnRfaWQiOiI3NXQzN25sc2JyZ3Vmc2VranJrazdnOGU5MyIsInVzZXJuYW1lIjoiYWF5dXNoIn0.r0W2lUtHzoBZAX-Daw4sbcyNg6VF2RZ5EV5jH5PkszVti3oCb8WS1S12GsgaDc1ujt_9Z89w5lnxzM8DkQBJRpnRc4BTfzTs21tt_0XHPB4MVUtq0SlIN6UeV0iXaySLoJgOkgks9J7UetBbHwSQRvoMEU_drjjpXnmPwT6gmRKnGWv3afpaBfsWnOaH9RwQyqTvk_CyKqPucn74d9fDPCe_iYjaBBp_42Z9_dzweMMRfCOqLwxw_1qogFdc6lanW-KB2Xtl81SBpLEsWGI4lFHO6b-G3hLRJf7kHtXMDlENMXGD9zMn1x2csYtkxXOTbgPUta7nSToKN3RvDu43_w";
    let token = req.headers.authorization;
    // console.log("token "+token);

    if (token === null || !token) {
        // return customError.sendError(res, 401, constants.MISSING_JWT);
        //some constants to return message for un-authorized
        res.status(400).send(constants.MISSING_JWT);
    } else {

        // token = token.replace(/^Bearer /, '');
        const decodedJwt = jwt.decode(token, { complete: true });
        // you need jwt library
        // console.log("hello1 " + decodedJwt.payload.iss);
        if (decodedJwt === null) {
            // return customError.sendError(res, 401, constants.INVALID_JWT);
            //SOME METHOD THAT RETURN RESPONSE 401 and DOES SOME LOGGING
            res.status(400).send(constants.INVALID_JWT);
        }
        try {
            const new_url = url.parse(decodedJwt.payload.iss);
            // console.log("new_url host  "+ new_url.host);
            if (new_url.host === "cognito-idp.us-east-1.amazonaws.com") {
                // const curr_token = "Bearer "+ token;
//********* THE BELOW METHOD WILL JUST VALIDATE THE TOKEN AGAINST THE //IDENITITY PROVIDER, IN OUR CASE ITS AWS THAT WILL BE EVALUATED FROM
//  req['Configuration']  *********

                checkValid().then((res)=>{
                    console.log("res  "+ res );
                    console.log("res data   "+ JSON.stringify(res));
                    req.body = res; //passing user_end_point data for authorization 
                    next();
                })
                .catch(e=>{
                    console.log("error in authentication   "+ e);
                });
                // @ts-ignore
                async function checkValid(){

                    var result = await checkTokenValidity("Bearer "+token,  req.authority);
                    
                    console.log("result "+ result);
                    if(result){
                        console.log("isValid Token");
                        // req.data = result;
                        //IF NEGETIVE THEN JUST SEND RESPONSE 401 (Un-Authorized)
                        return result;
                        // next();
                    }
                    else{
                        console.log("not valid token");
                        res.status(401).send("Unauthorized user");
                    }
                }
            }
        } catch (e) {
            // return customError.sendError(res, 401, constants.INVALID_JWT);
            res.status(400).send("error");
        }
    }
}

function checkTokenValidity(token:any, authority:any) {

    console.log("authority in authentication check  " + authority);
    //MAKE A CALL TO " https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Nl7rkrtXL/.well-known/openid-configuration "
    const Authentication_uri = authority + ".well-known/openid-configuration";
    console.log("Authentication uri    "+ Authentication_uri);

    var isTokenValid = false;

    let res = async ()=>{
            return await request(Authentication_uri,(error:any,res:any,body:any)=>{
            if(res.statusCode==200){
                console.log("body   "+ body);
                let data = JSON.parse(body);
                let userinfo_endpoint = data.userinfo_endpoint;
                const aHeaders = {
                    "Authorization": token
                }
                const options = {
                    url: userinfo_endpoint,
                    headers: aHeaders
                };

                request(options, (error:any,res:any,body:any)=>{
                    if(res.statusCode == 200){
                        // let data = JSON.parse(body);
                        console.log("user data  "+ body);
                        isTokenValid = true;
                        // return isTokenValid;
                        return body;
                    }else{
                        return isTokenValid;
                    }
                })
            }
        })
    }
    
        return res().then((res)=>{
            return res;
        })
        .catch(e=>{
            throw new Error("invalid token");
        })
   
}

    






// const Authentication_uri ="https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Nl7rkrtXL"+"/.well-known/openid-configuration";
    // console.log("Authentication uri    " + Authentication_uri);
    // console.log("token in checktokenvalidity"+token)

// var result = requester(Authentication_uri)
    //     .then((res) => {
    //         const data = JSON.parse(res);
    //         const user_uri = data.userinfo_endpoint;

    //         const aHeaders = {
    //             "Authorization": token
    //         }
    //         const options = {
    //             url: user_uri,
    //             headers: aHeaders
    //         };
    //         console.log("options     1" + options + "\n");
    //         console.log(options)
    //         return options;
    //     })
    //     .then((options) => {
    //         console.log("options     2" + options)
    //         requester(options)
    //             .then((res) => {
    //                 if (res) {
    //                     isTokenValid = true;
    //                 }
    //             })
    //             console.log("userr");
    //         return isTokenValid;
    //     })
    //     .catch((error) => {
    //         // console.log("error " + error);
    //         throw new Error("invalid token");
    //     })
 // return isTokenValid;