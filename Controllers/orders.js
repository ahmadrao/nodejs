const dbConnection = require('./dbConnection');

const fetchAllItems = (reqData,callback) => {
  let query = ""
  let queryData = ""
  if(reqData.user_id == -99){
    query = "select * from orders where device_id = ? && user_id = -99"
    queryData = [reqData.device_id]
  }else{
    query = "select * from orders where user_id = ?"
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

const read = (callback) => {
  dbConnection.query("select * from orders order by ID desc").then((data)=>{
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

const fetchOrderDetails = (id,callback) => {
  dbConnection.queryWithParams("select * from orders where ID = ?",[id]).then((data)=>{
    if(data == undefined || data.length ==0){
      return callback({
        "error" : true,
        "message" : "Record not found with ID # " + id
      });
    }else{
      let order = data[0];
      dbConnection.queryWithParams("select * from vechiles where ID = ?",[order.vechile_id]).then((data2)=>{
        dbConnection.queryWithParams("select c.*,p.name from cart c join products p on c.product_id = p.ID where order_id = ? && isPurchased = 'yes' ",[order.ID]).then((data3)=>{
          dbConnection.queryWithParams("select * from users where ID = ?",[order.user_id]).then((data4)=>{

            let vechileFound = false;
            let cartFound = false;
            let userFound = false;
            let userData = {};
            let vehicleData = {};
            let cartData = [];
            if(data2 != undefined && data2.length !=0){
              vechileFound = true;
              vehicleData = data2[0];
            }
              if(data3 != undefined && data3.length !=0){
              cartFound = true;
              cartData = data3;
            }
              if(data4 != undefined && data4.length !=0){
              userFound = true;
              userData = data4[0];
            }

            return callback({
              "error" : false,
              "order" : order,
              "vechileFound" : vechileFound,
              "cartFound" : cartFound,
              "vechile" : vehicleData,
              "cart" : cartData,
              "userFound" : userFound,
              "userData" : userData
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
      }).catch((err)=>{
        console.log(err);
        return callback({
          "error" : true,
          "message" : "Something went wrong.Please try again later."
        });
      });
    }
  }).catch((err)=>{
    console.log(err);
    return callback({
      "error" : true,
      "message" : "Something went wrong.Please try again later."
    });
  });
}

const deleteRecord = (id,callback) => {
  dbConnection.queryWithParams("delete from orders where ID = ?",[id]).then((data)=>{
    return callback(false,"Record deleted successfully");
  }).catch((err)=>{
    return callback(true,"Something went wrong.");
  });
}

const complete_order = (id,callback) => {
  dbConnection.queryWithParams("update orders set status = 'completed' where ID = ?",[id]).then((data)=>{
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
  fetchAllItems,
  read,
  fetchOrderDetails,
  deleteRecord,
  complete_order
}
