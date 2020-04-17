const mysql = require("mysql");
const config = require("./config");

const pool = mysql.createPool({
  "host" : config.host,
  "user" : config.user,
  "database" : config.database_name,
  "password" : config.password
});

const query = (sql) => {
 return new Promise((resolve,reject)=>{
   pool.getConnection((error,connection)=>{
     if(error){
       return reject(error);
     }else{
       connection.query(sql,(queryError,results,fields)=>{
         if(queryError){
           return reject(queryError);
         }else{
           return resolve(results);
         }
       });
     }
   });
 });
};

const queryWithParams = (sql,params) => {
  return new Promise((resolve,reject)=>{
    pool.getConnection((error,connection)=>{
      if(error){
        return reject(error);
      }else{
        connection.query(sql,params,(queryError,results,fields)=>{
          if(queryError){
            return reject(queryError);
          }else{
            return resolve(results);
          }
        });
      }
    });
  });
};

module.exports = {
  query,
  queryWithParams
}
