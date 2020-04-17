const dbConnection = require('./dbConnection');

const sign_in = (reqData,callback) => {
  if(!reqData.phone_number.includes("+")){
    reqData.phone_number = "+" + reqData.phone_number;
  }
  dbConnection.queryWithParams("select * from users where phone_number = ? and password = ?",[reqData.phone_number,reqData.password])
  .then((data)=>{
    if(data == undefined || data.length == 0){
      // user does not exit
      return callback({
        "error" : true,
        "message" : "Password/phone_number is incorrect"
      });
    }else{
      // user found
      return callback({
        "error" : false,
        "message" : "Logged In Successfully",
        "user" : data[0]
      });
    }
  })
  .catch((err)=>{
    console.log(err);
    return callback({
      "error" : true,
      "message" : "Something went wrong.Please try again later."
    });
  });
}

const register_user = (reqData,callback) => {
  dbConnection.queryWithParams("select * from users where email = ? || phone_number = ?",[reqData.email,reqData.phone_number])
  .then((data)=>{
    if(data == undefined || data.length == 0){
      // user does not exit
      var user = {
        "first_name" : reqData.first_name,
        "family_name" : reqData.family_name,
        "date_of_birth" : reqData.date_of_birth,
        "id_number" : reqData.id_number,
        "phone_number" : reqData.phone_number,
        "email" : reqData.email,
        "password" : reqData.password,
        "gender" : reqData.gender,
        "account_status" : "unverified",
        "profile_address" : "user.png",
      };
      dbConnection.queryWithParams("insert into users set ?",user).then((insertData)=>{
        user["ID"] = insertData.insertId;
        return callback({
          "error" : false,
          "message" : "Account created.",
          "user" : user
        });
      }).catch((error)=>{
        console.log(error);
        return callback({
          "error" : true,
          "message" : "Something went wrong."
        });
      });
    }else{
      let user = data[0];
      if(user.email == reqData.email && user.phone_number == reqData.phone_number){
        return callback({
          "error" : true,
          "message" : "User already exits with this email and phone number"
        });
      }else if(user.email == reqData.email && user.phone_number != reqData.phone_number){
        return callback({
          "error" : true,
          "message" : "User already exits with this email"
        });
      }else if(user.email != reqData.email && user.phone_number == reqData.phone_number){
        return callback({
          "error" : true,
          "message" : "User already exits with this phone number"
        });
      }
    }
  }).catch((error)=>{
    console.log(error);
    return callback({
      "error" : true,
      "message" : "Something went wrong."
    });
  });
}

const verify_account = (reqData,callback) => {
  dbConnection.queryWithParams("update users set account_status = 'verified' where phone_number = ?",[reqData.phone_number]).then((data)=>{
    return callback({
      "error" : false,
      "message" : "Account verified Successfully."
    });
  }).catch((error)=>{
    console.log(error);
    return callback({
      "error" : true,
      "message" : "Something went wrong."
    });
  });
}

const update_profile = (reqData,callback) => {
  dbConnection.queryWithParams("update users set profile_address = ? where ID = ?",[reqData.profile,reqData.userId]).then((data)=>{
    return callback({
      "error" : false,
      "message" : "Picture Updated Successfully",
      "profile" : reqData.profile
    });
  }).catch((error)=>{
    console.log(error);
    return callback({
      "error" : true,
      "message" : "Something went wrong."
    });
  });
}

const changePassword = (reqData,callback) => {
  dbConnection.queryWithParams("update users set password = ? where phone_number = ?",[reqData.password,reqData.phone_number]).then((data)=>{
    return callback({
      "error" : false,
      "message" : "password Updated Successfully"
    });
  }).catch((error)=>{
    console.log(error);
    return callback({
      "error" : true,
      "message" : "Something went wrong."
    });
  });
}

const update_profile_details = (reqData,callback) => {
  dbConnection.queryWithParams("update users set first_name = ?,family_name = ?,id_number=?,gender=? where ID = ?",[reqData.first_name,reqData.family_name,reqData.id_number,reqData.gender,reqData.userID]).then((data)=>{
    return callback({
      "error" : false,
      "message" : "profile Updated Successfully"
    });
  }).catch((error)=>{
    console.log(error);
    return callback({
      "error" : true,
      "message" : "Something went wrong."
    });
  });
}

const fetchAllUsers = (callback) => {
  dbConnection.query("select * from users order by ID desc").then((data)=>{
    return callback({
      "error" : false,
      "data" : data
    });
  }).catch((err)=>{
    console.log(err);
    return callback({
      "error" : true,
      "message" : "Something went wrong.Please try again later."
    });
  });
}

const fetchSingleRecord = (id) => {
  return new Promise((a,b)=>{
    dbConnection.queryWithParams("select * from users where ID = ?",[id]).then((data)=>{
      if(data == undefined || data.length ==0){
        return a({
          "error" : true
        });
      }else{
        return a({
          "error" : false,
          "data" : data[0]
        });
      }
    }).catch((err)=>{
      return b(err);
    });
  });
}

const deleteRecord = (id,callback) => {
  dbConnection.queryWithParams("delete from users where ID = ?",[id]).then((data)=>{
    return callback(false,"Record deleted successfully");
  }).catch((err)=>{
    return callback(true,"Something went wrong.");
  });
}

const make_employee = (id,callback) => {
  dbConnection.queryWithParams("update users set account_type = 'employee' where ID = ?",[id]).then((data)=>{
    return callback({
      "error" : false
    });
  }).catch((error)=>{
    console.log(error);
    return callback({
      "error" : true,
      "message" : "Something went wrong."
    });
  });
}

module.exports = {
  sign_in,
  register_user,
  verify_account,
  changePassword,
  update_profile,
  update_profile_details,
  fetchAllUsers,
  fetchSingleRecord,
  deleteRecord,
  make_employee
}
