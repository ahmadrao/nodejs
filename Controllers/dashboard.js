const dbConnection = require("./dbConnection");

function read(){
  return new Promise((resolve,reject)=>{
    allUsers().then((a)=>{
      allProducts().then((b)=>{
        allOrders().then((c)=>{
          allPayments().then((d)=>{
            return resolve({
              "allUsers" : a,
              "allProducts" : b,
              "allOrders" : c,
              "allPayments" : d
            });
          }).catch((err)=>{
            return reject(err);
          });
        }).catch((err)=>{
          return reject(err);
        });
      }).catch((err)=>{
        return reject(err);
      });
    }).catch((err)=>{
      return reject(err);
    });
  });
}

const allUsers = () => {
  return new Promise((a,b)=>{
    dbConnection.query("select count(ID) as total from users").then((data)=>{
      return a(data[0].total);
    }).catch((err)=>{
      return b(err);
    });
  });
}

const allProducts = () => {
  return new Promise((a,b)=>{
    dbConnection.query("select count(ID) as total from products").then((data)=>{
      return a(data[0].total);
    }).catch((err)=>{
      return b(err);
    });
  });
}

const allOrders = () => {
  return new Promise((a,b)=>{
    dbConnection.query("select count(ID) as total from orders").then((data)=>{
      return a(data[0].total);
    }).catch((err)=>{
      return b(err);
    });
  });
}

const allPayments = () => {
  return new Promise((a,b)=>{
    dbConnection.query("select sum(amount) as total from orders").then((data)=>{
      return a(data[0].total);
    }).catch((err)=>{
      return b(err);
    });
  });
}

module.exports = {read};
