require('dotenv').config();

let getDataBaseConnectionString = function(){
    let DATABASE_HOST = process.env.DB_HOST;
    let DATABASE_USERNAME = process.env.DB_USER;
    let DATABASE_PORT = process.env.DB_PORT;
    let DATABASE_NAME = process.env.DB_NAME;
    let DATABASE_PASSWORD = process.env.DB_PASSWORD;
    console.log("hello   "+ DATABASE_HOST+"  "+ DATABASE_USERNAME + " " +  DATABASE_PORT + " " + DATABASE_NAME + " " +DATABASE_PASSWORD );
    if (DATABASE_USERNAME && DATABASE_PASSWORD && DATABASE_HOST && DATABASE_NAME) {
        let DB_CONN_STRING = "postgres://" + DATABASE_USERNAME + ":" + DATABASE_PASSWORD + "@" + DATABASE_HOST + ":" + DATABASE_PORT + "/" + DATABASE_NAME;
        return DB_CONN_STRING;
    }
    return null;
}

module.exports = {getDataBaseConnectionString : getDataBaseConnectionString};