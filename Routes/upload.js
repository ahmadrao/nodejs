const express = require('express');
const router = express.Router();
const multer = require('multer');
const usersController = require("../Controllers/users");
const productsController = require("../Controllers/products");
const swal = require('sweetalert');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/uploadedFiles")
  },
  filename: function (req, file, cb) {
    cb(null, (new Date).getTime() + "_" + file.originalname)
  }
});

const upload = multer({ storage: storage })

router.post("/", upload.single("image"), (req,res)=>{
  console.log(req.file);
  if(req.file != undefined){
    var filename = req.file.filename;

    if(req.body.action == "profile_update"){
      req.body["profile"] = filename;
      usersController.update_profile(req.body,(ob)=>{
        res.send(ob);
      });
    }else if(req.body.action == "add_product"){
      req.body["image"] = filename;
      productsController.addProduct(req.body,(ob)=>{
        if(ob.error){
          res.render("addNewProduct",{
            "error" : true,
            "product_name" : req.body.product_name,
            "price" : req.body.price,
            "quantity" : req.body.quantity,
            "description" : req.body.description
          });
        }else{
          res.redirect("/products/web/read");
        }
      });
    }else{
      res.send({
        "error" : true,
        "message" : "action not supported."
      })
    }
  }else{
    res.send({
      "error" : true,
      "message" : "something went wrong."
    })
  }
});

module.exports = router;
