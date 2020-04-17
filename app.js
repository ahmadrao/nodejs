const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 3010;
const path = require('path');
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'www'));
app.use('/www',express.static('www'));
const config = require('./Controllers/config');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const ArrayList = require('arraylist');
const http = require('http').Server(app);
var io = require('socket.io')(http);
var onlineUsers = new ArrayList;
const store = require('./Controllers/store');
const dashboardController = require('./Controllers/dashboard');

function sendHeartbeat(){
  setTimeout(sendHeartbeat, 2500);
  io.emit('ping', { beat : 1 });
}

io.on('connection',(socket)=>{
  onlineUsers.add(socket.id);
});

setTimeout(sendHeartbeat, 1000);

app.post("/user-location",(req,res)=>{
  console.log(req.body);
  console.log("dist",store.getDistance(req.body.latitude,req.body.longitude,config.location.latitude,config.location.longitude));
  if(store.getDistance(req.body.latitude,req.body.longitude,config.location.latitude,config.location.longitude) <= 300){
    onlineUsers.forEach((item, i) => {
      io.to(item).emit('show-user-arrival-notification',{
        "orderID" : req.body.order_id,
        "name" :  req.body.name
      });
    });
    res.send({shouldStop : true})
  }else{
    res.send({shouldStop : false})
  }
});

app.post("/user-arrived",(req,res)=>{
  onlineUsers.forEach((item, i) => {
    io.to(item).emit('show-user-arrival-notification',{
      "orderID" : req.body.order_id,
      "name" :  req.body.name
    });
  });
  res.send({isSent : true})
});

app.use((req, res, next) => {
  req.body["io"] = io;
  req.body["onlineUsers"] = onlineUsers;
  next();
});

var options = {
  host: config.host,
  port: config.database_port,
  user: config.user,
  password: config.password,
  database: config.database_name,
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 604800000,
  createDatabaseTable: true,
  connectionLimit: 10,
  endConnectionOnClose: true,
  charset: 'utf8mb4_bin',
  schema: {
    tableName: 'sessions_users',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
};
var sessionStore = new MySQLStore(options);

app.use(cookieParser());
app.use(session({
  key: 'user_sid',
  secret: 'KMA*12Mv8asdOO)a(tbdoef)',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    path: '/',
    httpOnly: false,
    secure: false,
    maxAge: 365 * 24 * 60 * 60 * 1000
  },
  rolling: true
}));

app.use((req, res, next) => {
  if (req.cookies.user_sid && req.session.loggedUser === undefined) {
    res.clearCookie('user_sid');
  }
  next();
});

app.get('/', function (req, res){
  let user = req.session.loggedUser;
  if(user == undefined){
    res.redirect("/users/web/login");
  }else{
    dashboardController.read().then((data)=>{
    res.render("dashboard",{
      "error" : false,
      "data" : data
    });
  }).catch((err)=>{
    res.render("dashboard",{
      "error" : true,
      "message" : err
    });
  });
  }
});

app.get('/dashboard', function (req, res){
  let user = req.session.loggedUser;
  if(user == undefined){
    res.redirect("/users/web/login");
  }else{
    dashboardController.read().then((data)=>{
    res.render("dashboard",{
      "error" : false,
      "data" : data
    });
  }).catch((err)=>{
    res.render("dashboard",{
      "error" : true,
      "message" : err
    });
  });
  }
});

app.use("/users",require("./Routes/users"));
app.use("/upload",require("./Routes/upload"));
app.use("/products",require("./Routes/products"));
app.use("/vehicle",require("./Routes/vehicle"));
app.use("/cart",require("./Routes/cart"));
app.use("/orders",require("./Routes/orders"));
app.use("/uploadedFiles",express.static("./Routes/uploadedFiles"));

app.get('/logout',(req,res,next)=>{
  req.session.loggedUser = null;
  res.redirect("/users/web/login");
});

app.use((req,res,next)=>{
  const error = new Error('Requested Resource not found');
  error.status = 400;
  next(error);
});

app.use((error,req,res,next)=>{
  res.status(404).render("error_404");
});

http.listen(port,function(){
  console.log("server is running on port : ",port);
});
