const dbConnection = require('./dbConnection');

const addRecord = (reqData,callback) => {
  let vehicle = {
    "make_of_car" : reqData.make_of_car,
    "model_of_car" : reqData.model_of_car,
    "color_of_car" : reqData.color_of_car,
    "license_plate" : reqData.license_plate,
    "user_id" : reqData.user_id,
    "device_id" : reqData.device_id
  };
  dbConnection.queryWithParams("insert into vechiles set ? ",vehicle).then((data)=>{
    vehicle["ID"] = data.insertId;
    return callback({
      "error" : false,
      "message" : "record Added Successfully",
      "vehicle" : vehicle
    });
  }).catch((err)=>{
    console.log(err);
    return callback({
      "error" : true,
      "message" : "Something went wrong.Please try again later."
    });
  });
}

const fetchAllItems = (reqData,callback) => {

  let query = ""
  let queryData = ""
  if(reqData.user_id == -99){
    query = "select * from vechiles where device_id = ? && user_id = -99 order by ID desc"
    queryData = [reqData.device_id]
  }else{
    query = "select * from vechiles where user_id = ? order by ID desc"
    queryData = [reqData.user_id]
  }

  dbConnection.queryWithParams(query,queryData).then((data)=>{
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

module.exports = {
  addRecord,
  fetchAllItems
}
