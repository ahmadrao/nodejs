const express = require('express');
const router = express.Router();
const paymentController = require("../Controllers/payment");
const orderController = require("../Controllers/orders");
const moment = require('moment');

const session_out_check = (req,res,next)=>{
  if(req.session.loggedUser == undefined){
    return res.redirect("/users/web/login");
  }else{
    next();
  }
};

router.get("/web/read",session_out_check,(req,res)=>{
  orderController.read((ob)=>{
    ob["moment"] = moment
    res.render("all_orders", ob);
  });
});

router.post("/book",(req,res)=>{
  paymentController.chargePayment(req.body,(ob)=>{
    return res.send(ob);
  });
});

router.post('/read',(req,res,next)=>{
  orderController.fetchAllItems(req.body,(ob)=>{
    return res.send(ob);
  });
});

router.get("/web/details",session_out_check,(req,res,next)=>{
  if(!req.query.id){
    res.render("blank",{
      "error" : true,
      "message" : "Invalid request"
    });
  }else{
    orderController.fetchOrderDetails(req.query.id,(ob)=>{
      ob["moment"] = moment
      return res.render("order_details",ob);
    });
  }
});

router.get("/web/delete",session_out_check,(req,res,next)=>{
  if(!req.query.id){
    res.render("blank",{
      "error" : true,
      "message" : "Invalid request"
    });
  }else{
    orderController.deleteRecord(req.query.id,(err,message)=>{
      if(err){
        res.render("blank.ejs",{
          "error" : true,
          "message" : message
        });
      }else{
        res.redirect("/orders/web/read");
      }
    });
  }
});

router.get("/web/complete",session_out_check,(req,res,next)=>{
  if(!req.query.id){
    res.render("blank",{
      "error" : true,
      "message" : "Invalid request"
    });
  }else{
    orderController.complete_order(req.query.id,(ob)=>{
      if(ob.err){
        res.render("blank.ejs",{
          "error" : true,
          "message" : ob.message
        });
      }else{
        res.redirect("/orders/web/read");
      }
    });
  }
});

module.exports = router;
