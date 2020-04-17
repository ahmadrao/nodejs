const dbConnection = require('./dbConnection');
const async = require('async');

const addProduct = (reqData,callback) => {
  dbConnection.queryWithParams("insert into products set ? ",{
    "name" : reqData.product_name,
    "price" : reqData.price,
    "quantity" : reqData.quantity,
    "description" : reqData.description,
    "image" : reqData.image
  }).then((data)=>{
    return callback({
      "error" : false,
      "message" : "Product Added Successfully"
    });
  }).catch((err)=>{
    console.log(err);
    return callback({
      "error" : true,
      "message" : "Something went wrong.Please try again later."
    });
  });
}

const fetchAllProduct = (callback) => {
  dbConnection.query("select * from products order by ID desc").then((data)=>{
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

const fetchAllProduct_app = (reqData,callback) => {
  dbConnection.query("select * from products order by ID desc").then((data)=>{
    let query = ""
    let queryData = ""
    if(reqData.user_id == -99){
      query = "select * from suggested_products_for_user where device_id = ? && user_id = -99 "
      queryData = [reqData.device_id]
    }else{
      query = "select * from suggested_products_for_user where user_id = ? "
      queryData = [reqData.user_id]
    }
    dbConnection.queryWithParams(query,queryData).then((data2)=>{
      async.forEach(data,(d1)=>{
        d1["recommended"] = 0;
        async.forEach(data2,(d2)=>{
          if(d1.ID == d2.product_id){
            d1["recommended"] = 1;
          }
        });
      });
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

  }).catch((err)=>{
    console.log(err);
    return callback({
      "error" : true,
      "message" : "Something went wrong.Please try again later."
    });
  });
}

const deleteRecord = (id,callback) => {
  dbConnection.queryWithParams("delete from products where ID = ?",[id]).then((data)=>{
    return callback(false,"Record deleted successfully");
  }).catch((err)=>{
    return callback(true,"Something went wrong.");
  });
}

const fetchSingleRecord = (id) => {
  return new Promise((a,b)=>{
    dbConnection.queryWithParams("select * from products where ID = ?",[id]).then((data)=>{
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

function updateRecord(reqData,callback){
  return new Promise((a,b)=>{
    dbConnection.queryWithParams("update products set name = ? , price = ? , quantity = ? ,description = ? where ID = ?",[reqData.product_name,reqData.price,reqData.quantity,reqData.description,reqData.ID]).then((data)=>{
      return callback(false,"Product updated successfully");
    }).catch((err)=>{
      console.log(err);
      return callback(true,"Something went wrong.");
    });
  });
}

module.exports = {
  addProduct,
  fetchAllProduct,
  deleteRecord,
  fetchSingleRecord,
  updateRecord,
  fetchAllProduct_app
}
