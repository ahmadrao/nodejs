const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cart');

router.post('/read',(req,res,next)=>{
  cartController.fetchAllItems(req.body,(ob)=>{
    return res.send(ob);
  });
});

router.post('/add',(req,res,next)=>{
  cartController.addItemToCart(req.body,(ob)=>{
    return res.send(ob);
  });
});

router.post('/change',(req,res,next)=>{
  cartController.update_quantity(req.body,(ob)=>{
    return res.send(ob);
  });
});

router.post('/remove',(req,res,next)=>{
  cartController.remove_item_from_cart(req.body,(ob)=>{
    return res.send(ob);
  });
});

module.exports = router;
