
var request = require("request");
require('dotenv').config()

async function requester1(options:any){

    return await new Promise((resolve:any,reject:any)=>{
        request(options, (error:any,response:any,body:any)=>{
            let data = JSON.parse(body);
            if(!error && response.statusCode==200 && data.length!=0){
                console.log(data.length);
                console.log(typeof data);
                resolve(body);
            }
            else {
                throw new Error("Something went wrong");
            }
        })
    })
}

let verbExtractor = (method:any) =>{

    switch(method){
        case "get":
            return "Read";
        case "post":
            return "Create";
        case "put":
            return "Update";
        default:
            return "Delete"
    }
}

let getRouteName = (path:any)=>{
    let _routeName = JSON.stringify(path);
    let finalRouteName:any;
    let i=1;
    while(_routeName[i]!="/"){
        finalRouteName+=_routeName[i];
        i++;
    }

    finalRouteName = finalRouteName[0].toUpperCase() + finalRouteName.slice(1);
    return "_"+finalRouteName;
}

module.exports = function authorizeToken(req:any, res:any, next:any){
    console.log("authorization middleware worked");
    //create a method for req.method
    let operationVerb = verbExtractor(req.route.stack[0].method);
    //build feature name from environment.MODULE_NAME + _routeName
    // console.log("route name is \n" + JSON.stringify(req.route.path)+ "\n");
    console.log("route method " + req.route.stack[0].method);
    
    // console.log("params  "+ JSON.stringify(req.params));
    // let featureName = "Smartup_Channels";
    
    // _routeName = _routeName.substr(1,_routeName.length);
    let featureName = process.env.MODULE_NAME + getRouteName(req.route.path);
    let claims = "";

    try{
        let platform_claim_url = process.env.PLATFORM_CLAIM_URL;
        // let platform_claim_url = process.env.PLATFORM_LOCAL_URL;
        let url = "";
        // let email = req.data.email;
        // let siteUrl = req.data.host;
        //take host from req.referer
        if(operationVerb!=null && featureName!=null)
        {
            console.log("In url if block");
            url += req.body.email as string + "/" + req.headers.Referer as string + "/" + process.env.MODULE_NAME as string +
                    "/" + operationVerb + "/" + featureName;
            // url += "aayush@trakinvest.com/" + "localhost:3005/" + "SmartUp"+
            //     "/" + operationVerb + "/" + featureName;
            // console.log("url if block   " + url);
        }
        else
        {
            console.log("In url else block");
            if(process.env.MODULE_NAME!=null)
            {
                url += req.body.email + "/" + req.headers.Referer + "/" + process.env.MODULE_NAME;
            }
            else
            {
                url += req.body.email + "/" + req.headers.Referer;
            }
        }
        platform_claim_url +=url;
        console.log("claim url       " +platform_claim_url);

        // let AuthorizationHeaders = {
        //     "Special-Key": process.env.SPECIAL_KEY as string,
        //     "Content-Type" : process.env.CONTENT_TYPE as string,
        //     "Referer" : process.env.REFERER as string
        // }
        //"Special-Key": process.env.SPECIAL_KEY,

        //add token in authorization (do not add for now)
        let AuthorizationHeaders = {
            "Content-Type" : process.env.CONTENT_TYPE,
            "Referer" : req.headers.Referer
        }

        let options = {
            url: platform_claim_url,
            headers: AuthorizationHeaders
        }

        let result = requester1(options)
            .then((res)=>{
                console.log(res);
                next();
            })
            .catch((error)=>{
                console.log(error);
            })
    }
    catch(e){
        // console.log("error  " + e);
        // throw new Error("Something went wrong");
        res.status(400).send("error");
    }

}




// var request = require("request");
// require('dotenv').config()

// async function requester1(options:any){

//     return await new Promise((resolve:any,reject:any)=>{
//         request(options, (error:any,response:any,body:any)=>{
//             let data = JSON.parse(body);
//             if(!error && response.statusCode==200 && data.length!=0){
//                 console.log(data.length);
//                 console.log(typeof data);
//                 resolve(body);
//             }
//             else {
//                 throw new Error("Something went wrong");
//             }
//         })
//     })
// }


// module.exports = function authorizeToken(req:any, res:any, next:any){
//     console.log("authorization middleware worked");
//     let operationVerb = "Create";
//     let featureName = "Smartup_Channels";
//     let claims = "";

//     try{
//         let platform_claim_url = process.env.PLATFORM_CLAIM_URL;
//         // let platform_claim_url = process.env.PLATFORM_LOCAL_URL;
//         let url = "";
//         // let email = req.data.email;
//         // let siteUrl = req.data.host;
//         //take host from req.referer
//         if(operationVerb!=null && featureName!=null)
//         {
//             console.log("In url if block");
//             url += process.env.EMAIL as string + "/" + process.env.SITE_URL as string + "/" + process.env.MODULE_NAME as string+
//                     "/" + operationVerb + "/" + featureName;
//             // url += "aayush@trakinvest.com/" + "localhost:3005/" + "SmartUp"+
//             //     "/" + operationVerb + "/" + featureName;
//             // console.log("url if block   " + url);
//         }
//         else
//         {
//             console.log("In url else block");
//             if(process.env.MODULE_NAME!=null)
//             {
//                 url += process.env.EMAIL + "/" + process.env.SITE_URL + "/" + process.env.MODULE_NAME;
//             }
//             else
//             {
//                 url += process.env.EMAIL + "/" + process.env.SITE_URL;
//             }
//         }
//         platform_claim_url +=url;
//         console.log("claim url       " +platform_claim_url);

//         // let AuthorizationHeaders = {
//         //     "Special-Key": process.env.SPECIAL_KEY as string,
//         //     "Content-Type" : process.env.CONTENT_TYPE as string,
//         //     "Referer" : process.env.REFERER as string
//         // }

//         //Provided conrete values for now, later will loaded from request

//         let AuthorizationHeaders = {
//             "Content-Type" : "application/json"
//         }

//         let options = {
//             url: platform_claim_url,
//             headers: AuthorizationHeaders
//         }

//         let result = requester1(options)
//             .then((res)=>{
//                 console.log(res);
//                 next();
//             })
//             .catch((error)=>{
//                 console.log(error);
//             })
//     }
//     catch(e){
//         // console.log("error  " + e);
//         // throw new Error("Something went wrong");
//         res.status(400).send("error");
//     }

// }


// //https://platform.antronsys.com/v1/Authorize/GetClaims/aayush@trakinvest.com/smartup.trakinvest.com/SmartUp/Create/Smartup_Channels