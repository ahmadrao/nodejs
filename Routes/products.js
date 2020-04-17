const express = require('express');
const router = express.Router();
const productsController = require("../Controllers/products");

const session_out_check = (req,res,next)=>{
  if(req.session.loggedUser == undefined){
    return res.redirect("/users/web/login");
  }else{
    next();
  }
};

router.post("/read",(req,res)=>{
  productsController.fetchAllProduct_app(req.body,(ob)=>{
    res.send(ob);
  });
});

router.get("/web/read",session_out_check,(req,res)=>{
  productsController.fetchAllProduct((ob)=>{
    res.render("all_products", ob);
  });
});

router.get("/web/add",session_out_check,(req,res)=>{
  res.render("addNewProduct",{
    "error" : false,
    "product_name" : "",
    "price" : "",
    "quantity" : "",
    "description" : ""
  });
});

router.get("/web/update",session_out_check,(req,res,next)=>{
  if(!req.query.id){
    res.render("blank",{
      "error" : true,
      "message" : "Invalid request"
    });
  }else{
    productsController.fetchSingleRecord(req.query.id).then((data)=>{
      if(data.error){
        res.render("blank.ejs",{
          "error" : true,
          "message" : "Record not found"
        });
      }else{
        res.render("update_product",{
          "error" : false,
          "product_name" : data.data.name,
          "price" : data.data.price,
          "quantity" : data.data.quantity,
          "description" : data.data.description,
          "ID" : data.data.ID
        });
      }
    }).catch((err)=>{
      res.render("blank.ejs",{
        "error" : true,
        "message" : "Record not found"
      });
    });
  }
});

router.post("/web/update",session_out_check,(req,res,next)=>{
  if(!req.query.id){
    res.render("blank",{
      "error" : true,
      "message" : "Invalid request"
    });
  }else{
    req.body["ID"] = req.query.id;
    productsController.updateRecord(req.body,(err,message)=>{
      if(err){
        res.render("update_product",{
          "error" : true,
          "product_name" : req.body.product_name,
          "price" : req.body.price,
          "quantity" : req.body.quantity,
          "description" : req.body.description,
          "ID" : req.query.id,
          "message" : message
        });
      }else{
        res.redirect("/products/web/read");
      }
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
    productsController.deleteRecord(req.query.id,(err,message)=>{
      if(err){
        res.render("blank.ejs",{
          "error" : true,
          "message" : message
        });
      }else{
        res.redirect("/products/web/read");
      }
    });
  }
});

module.exports = router;
