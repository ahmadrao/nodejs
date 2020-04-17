const express = require('express');
const router = express.Router();
const vehicleController = require("../Controllers/vehicle");

router.post("/add",(req,res)=>{
  vehicleController.addRecord(req.body,(ob)=>{
    return res.send(ob);
  });
});

router.post("/read",(req,res)=>{
  vehicleController.fetchAllItems(req.body,(ob)=>{
    return res.send(ob);
  });
});

module.exports = router;
