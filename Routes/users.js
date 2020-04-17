const express = require('express');
const router = express.Router();
const usersController = require("../Controllers/users");

const session_out_check = (req,res,next)=>{
  if(req.session.loggedUser == undefined){
    return res.redirect("/users/web/login");
  }else{
    next();
  }
};

router.get("/web/read", session_out_check,(req,res)=>{
  usersController.fetchAllUsers((ob)=>{
    ob["userID"] = req.session.loggedUser.ID;
    res.render("all_users", ob);
  });
});

router.get("/web/details",session_out_check,(req,res,next)=>{
  if(!req.query.id){
    res.render("blank",{
      "error" : true,
      "message" : "Invalid request"
    });
  }else{
    usersController.fetchSingleRecord(req.query.id).then((data)=>{
      if(data.error){
        res.render("blank.ejs",{
          "error" : true,
          "message" : "Record not found with ID # " + req.query.id
        });
      }else{
        res.render("user_details",{
          "error" : false,
          "user" : data.data
        });
      }
    }).catch((err)=>{
      res.render("blank.ejs",{
        "error" : true,
        "message" : "Record not found with ID # " + req.query.id
      });
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
    usersController.deleteRecord(req.query.id,(err,message)=>{
      if(err){
        res.render("blank.ejs",{
          "error" : true,
          "message" : message
        });
      }else{
        res.redirect("/users/web/read");
      }
    });
  }
});

router.get("/web/change_account_type",session_out_check,(req,res,next)=>{
  if(!req.query.id){
    res.render("blank",{
      "error" : true,
      "message" : "Invalid request"
    });
  }else{
    usersController.make_employee(req.query.id,(ob)=>{
      if(ob.err){
        res.render("blank.ejs",{
          "error" : true,
          "message" : ob.message
        });
      }else{
        res.redirect("/users/web/read");
      }
    });
  }
});

router.post("/create",(req,res)=>{
  usersController.register_user(req.body,(ob)=>{
    return res.send(ob);
  });
});

router.post("/login",(req,res)=>{
  usersController.sign_in(req.body,(ob)=>{
    return res.send(ob);
  });
});

const session_in_check = (req,res,next)=>{
  if(req.session.loggedUser != undefined){
    return res.redirect("/dashboard");
  }else{
    next();
  }
};


router.get("/web/login", session_in_check ,(req,res,next)=>{
  res.render("login",{
    "error" : false,
    "phone_number" : '',
    "password" : ''
  });
});

router.post("/web/login", session_in_check ,(req,res,next)=>{
  let phone_number = req.body.phone_number;
  let password = req.body.password;
  let error_message = "";

  if(!phone_number){
    error_message += "Please enter phone number.\n";
  }
  if(!password){
    error_message += "Please enter password.\n";
  }

  if(!error_message){
    usersController.sign_in(req.body,(ob)=>{
      if(ob.error){
        res.render("login",{
          "error" : true,
          "phone_number" : phone_number,
          "password" : password,
          "message" : ob.message
        });
      }else{
        // save user session and re direct
        if(ob.user.account_type != "customer"){
          req.session.loggedUser = ob.user;
          req.session.save();
          res.redirect('/');
        }else{
          res.render("login",{
            "error" : true,
            "phone_number" : phone_number,
            "password" : password,
            "message" : "You are not authorized to use this console."
          });
        }
      }
    });
  }else{
    res.render("login",{
      "error" : true,
      "phone_number" : phone_number,
      "password" : password,
      "message" : error_message
    });
  }
});

router.post("/verify",(req,res)=>{
  usersController.verify_account(req.body,(ob)=>{
    return res.send(ob);
  });
});

router.post("/change_password",(req,res)=>{
  usersController.changePassword(req.body,(ob)=>{
    return res.send(ob);
  });
});

router.post("/update_profile",(req,res)=>{
  usersController.update_profile_details(req.body,(ob)=>{
    return res.send(ob);
  });
});

module.exports = router;
