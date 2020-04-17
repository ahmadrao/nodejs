const dbConnection = require('./dbConnection');

const addItemToCart = (reqData,callback) => {
  isItemInCart(reqData.product_id,reqData.user_id,reqData.device_id,(status)=>{
    if(status.error){
      return callback({
        "error" : true,
        "message" : "Something went wrong.Please try again later."
      });
    }else{
      if(status.inCart){
        return callback({
          "error" : true,
          "message" : reqData.product_name + " is already in cart."
        });
      }else{
        let item = {
          "product_id" : reqData.product_id,
          "user_id" : reqData.user_id,
          "device_id" : reqData.device_id,
          "quantity" : 1,
          "isPurchased" : "no"
        };
        dbConnection.queryWithParams("insert into cart set ? ", item).then((data)=>{
          item["ID"] = data.insertId;
          item["product_name"] = reqData.product_name;
          item["product_price"] = reqData.product_price;
          return callback({
            "error" : false,
            "message" : "Item Added to cart",
            "item" : item
          });
        }).catch((err)=>{
          console.log(err);
          return callback({
            "error" : true,
            "message" : "Something went wrong.Please try again later."
          });
        });
      }
    }
  });
}

const isItemInCart = (product_id,user_id,device_id,callback) => {

  let query = ""
  let queryData = ""
  if(user_id == -99){
    query = "select * from cart where product_id = ? && device_id = ? && isPurchased = 'no' && user_id = -99 "
    queryData = [product_id,device_id]
  }else{
    query = "select * from cart where product_id = ? && user_id = ? && isPurchased = 'no' "
    queryData = [product_id,user_id]
  }

  dbConnection.queryWithParams(query,queryData)
  .then((data)=>{
    if(data == undefined || data.length == 0){
      return callback({
        "error" : false,
        "inCart" : false
      });
    }else{
      return callback({
        "error" : false,
        "inCart" : true
      });
    }
  }).catch((err)=>{
    console.log(err);
    return callback({
      "error" : true,
      "inCart" : null
    });
  });
}

const update_quantity = (reqData,callback) => {
  dbConnection.queryWithParams("update cart set quantity = ? where ID = ? && isPurchased = 'no' ",
  [reqData.quantity,reqData.cart_id])
  .then((data)=>{
    return callback({
      "error" : false,
      "message" : "quantity updated successfully"
    });
  }).catch((err)=>{
    console.log(err);
    return callback({
      "error" : true,
      "message" : "Something went wrong.Please try again later."
    });
  });
}

const remove_item_from_cart = (reqData,callback) => {
  dbConnection.queryWithParams("delete from cart where ID = ? && isPurchased = 'no' ",
  [reqData.cart_id])
  .then((data)=>{
    return callback({
      "error" : false,
      "message" : "removed successfully"
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
    query = "select c.*,p.name as product_name, p.price as product_price from cart c join products p on c.product_id = p.ID where c.device_id = ? && c.isPurchased = 'no' && user_id = -99 order by c.ID desc"
    queryData = [reqData.device_id]
  }else{
    query = "select c.*,p.name as product_name, p.price as product_price from cart c join products p on c.product_id = p.ID where c.user_id = ? && c.isPurchased = 'no' order by c.ID desc"
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
  addItemToCart,
  update_quantity,
  remove_item_from_cart,
  fetchAllItems
}
