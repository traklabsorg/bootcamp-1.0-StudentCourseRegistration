var request = require("request");

module.exports = async function requester(options:any){

    return await request(options, (error:any,response:any,body:any)=>{
        if(!error && response.statusCode==200){
            return body;
        }
        else {
            throw new Error("Something went wrong");
        }
    })
};