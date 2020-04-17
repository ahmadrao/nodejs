const stripe = require('stripe')('sk_test_gM1veasJZa0rRNaz1BELyNe200awPO4PZG');
const dbConnection = require("./dbConnection");
const async = require('async');

function chargePayment(reqData,callback){
  stripe.customers.create({
    "email" : reqData.email,
    "source" : reqData.stripe_token
  }).then((customer) => {
    return stripe.customers.createSource(customer.id, {
      source: 'tok_visa'
    });
  }).then((source) => {
    return stripe.charges.create({
      amount:  Math.round(Number(reqData.totalPrice)) * 100,
      currency: 'usd',
      customer: source.customer
    });
  }).then((charge) => {
    let order = {
      "user_id" : Number(reqData.user_id),
      "stripe_transaction_id" : charge.id,
      "date" : (new Date).getTime(),
      "vechile_id" : Number(reqData.vechile_id),
      "status" : "pending",
      "device_id" : reqData.device_id,
      "amount" : parseFloat(reqData.totalPrice)
    }
    dbConnection.queryWithParams("insert into orders set ?",order).then((data)=>{
      order["ID"] = data.insertId;

      let json_items = JSON.parse(reqData.items_id);

      async.forEach(json_items,(ob)=>{
        manage_cart( ob.product_id, reqData.user_id,reqData.device_id,order.ID,ob.ID);
      });

      reqData.onlineUsers.forEach((item, i) => {
        reqData.io.to(item).emit('show-order-notification',{
          "orderID" : order.ID,
          "name" : reqData.name
        });
      });

      return callback({
        "error" : false,
        "message" : "Order placed successfully",
        "order" : order,
        "order_id" : order.ID
      });

    }).catch((err)=>{
      console.log(err);
      return callback({
        error : true,
        message : "Something went wrong.Please try again later or contact support team."
      });
    });
  }).catch((err) => {
    console.log(err);
    return callback({
      error : true,
      message : "Something went wrong.Please try again later or contact support team."
    });
  });
}

const manage_cart = (product_id,user_id,device_id,order_id,ID) => {
  let query = ""
  let queryData = ""
  if(user_id == -99){
    query = "select * from cart where product_id = ? && device_id = ? && isPurchased = 'yes' && user_id = -99 "
    queryData = [product_id,device_id]
  }else{
    query = "select * from cart where product_id = ? && user_id = ? && isPurchased = 'yes' "
    queryData = [product_id,user_id]
  }
  dbConnection.queryWithParams(query,queryData).then((data)=>{
    if(data == undefined || data.length == 0){
      dbConnection.queryWithParams("update cart set isPurchased = 'yes' , order_id = ? where ID = ?",[order_id,ID]).then((data2)=>{}).catch((err)=>{console.log(err);});
    }else{
      dbConnection.queryWithParams("insert into suggested_products_for_user set ?",{
        "user_id" : user_id,
        "device_id" : device_id,
        "product_id" : product_id
      }).then((data2)=>{
        dbConnection.queryWithParams("update cart set isPurchased = 'yes' , order_id = ? where ID = ?",[order_id,ID]).then((data2)=>{}).catch((err)=>{console.log(err);});
      }).catch((err)=>{console.log(err);});
    }
  }).catch((err)=>{
    console.log(err);
  });
}

module.exports = {chargePayment};
