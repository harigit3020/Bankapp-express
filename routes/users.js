var express = require('express');
const bank = require('../services/bank');
var router = express.Router();
var Bank = require('../services/bank');
function authMiddleware(req, res, next) { //Router level middleware
  console.log("authMiddileware");
  if (req.session.CurrentUser) {
    next()
  } else {
    res.status(401).send({ message: "User not authenticed" })
  }
}

/* GET users listing. */
router.get('/', authMiddleware, function (req, res) {
  Bank.getUsers()
  .then(data=>{
    res.status(data.statusCode).send({message:data.message,users:data.users})
  });
});
router.post('/register', function (req, res) {
  let usname = req.body.username;
  let pwd = req.body.password;
  let cpwd = req.body.conpass;
  let acntno = req.body.acntno;
  // let data = Bank.getUsers()
  // if (usname in data) {
  //   res.status(400).send({ message: "User already exist please login!" });
  if (pwd !== cpwd) {
    res.status(400).send({ message: "Password Missmatch" });
  } 
  else{
    Bank.addUser(usname,pwd,acntno)
    .then(data=>{
      res.status(data.statusCode).send({message:data.message});
    });
  }
});
router.post('/login', function (req, res) {
  let usname = req.body.username;
  let pwd = req.body.password;
  Bank.login(usname,pwd)
  .then(data=>{
    if(data.statusCode==200){
      req.session.CurrentUser=usname;
    }
    res.status(data.statusCode).send({message:data.message})
  })
  // let data = Bank.getUsers()
  // console.log(data)
  // if (usname in data) {
  //   let password = data[usname]["password"];
  //   if (pwd == password) {
  //     req.session.CurrentUser = usname;
  //     // Bank.setCurrentUser(usname);
  //     res.send({ message: "login sucess!" });
  //   }
  //   else {
  //     res.status(400).send({ message: "login failed!" });
  //   }
  // }
  // else {
  //   res.status(400).send({ message: "invalid user" })
  // }
});
router.post('/deposit', authMiddleware, function (req, res) {
  let uname = req.body.usernamedep;
  let amt = Number(req.body.amountdep);
  if (uname != req.session.CurrentUser){
    res.status(400).send({message:"Invalid User!"})
  }
  Bank.deposit(uname,amt)
  .then(data=>{
    res.status(data.statusCode).send({message:data.message,balance:data.balance})
  })
  // let data = Bank.getUsers();
  // if (uname in data) {
  //   if (uname != req.session.CurrentUser) {
  //     res.status(400).send({ message: "Invalid user" });
  //   }
  //   data[uname]["balance"] += amt;
  //   let balance = data[uname]["balance"]
  //   data[uname]["history"].push({
  //     typeOfTransaction: "Credit",
  //     amount: amt
  //   })
  //   res.send({ balance: balance, message: "Deposit Successfull!" });
  // } else {
  //   res.status(400).send({ message: "Account not exist!" });
  // }
});
router.post('/withraw', authMiddleware, function (req, res) {
  let uname = req.body.usernamewith;
  let amt = Number(req.body.amountwith);
  if (uname != req.session.CurrentUser){
    res.status(400).send({message:"Invalid User!"})
  }
  Bank.withraw(uname,amt)
  .then(data=>{
    res.status(data.statusCode).send({message:data.message,balance:data.balance});
  })
 
  // let data = Bank.getUsers();
  // if (uname in data) {
  //   if (uname != req.session.CurrentUser) {
  //     res.status(400).send({ message: "Invalid user" });
  //   }
  //   let avbal = data[uname]["balance"];
  //   if (amt > avbal) {
  //     res.status(400).send({ balance: avbal, message: "Insufficient balance!" });
  //   } else {
  //     data[uname]["balance"] -= amt;
  //     let balance = data[uname]["balance"]
  //     data[uname]["history"].push({
  //       typeOfTransaction: "Debited",
  //       amount: amt
  //     })
  //     res.send({ balance: balance, message: "Withdrawel Successfull!" });
  //   }
  // } else {
  //   res.status(400).send({ message: "Account not exist!" });
  // }

});
router.get('/transactionhistory', authMiddleware, function (req, res) {
let uname = req.session.CurrentUser;
Bank.trashist(uname)
.then(data=>{
  res.status(data.statusCode).send({message:data.message,history:data.history})
})
  // let data = Bank.getUsers();
  // let uname = req.session.CurrentUser;
  // if (uname in data) {
  //   return res.send({ history: data[uname].history });
  // } else {
  //   res.status(400).send({ message: "invalid user" });
  // }

});
router.delete('/', authMiddleware, function (req, res) {
  let uname = req.body.username;
  Bank.deleteUser(uname)
  .then(data=>{
    res.status(data.statusCode).send({message:data.message})
  }) 
  });
  router.delete("/:id",function(req,res){
    Bank.deleteUser(req.params.id)
    .then(data=>{
      res.status(data.statusCode).send({message:data.message})
    })

  })

router.post('/transfer', authMiddleware, function (req, res) {
  // let data = Bank.getUsers();
  let sender = req.session.CurrentUser;
  let reciver = req.body.reciver;
  let amnt = Number(req.body.amnt);
  if(sender!==reciver){
    Bank.withraw(sender,amnt)
    .then(data=>{
      let balance=data.balance;
      if(data.statusCode==200){
        Bank.deposit(reciver,amnt)
        .then(data=>{
          if(data.statusCode==200){
            res.status(200).send({message:amnt+"Rs Successfully Transfer to "+reciver,balance:balance})
          }else{
            res.status(400).send({message:"Invalid Receiver!  "+amnt+ "Rs have credited back to your account"})
            Bank.deposit(sender,amnt)
          }
        })
      }else{
        res.status(400).send({message:"Insufficent balance to transfer "+"Ava.bal:"+data.balance})
      }
    })
  }else{
    res.status(400).send({message:"Self transfer not allowed"})
  }
  // if ((sender in data) && (reciver in data)&&(sender!=reciver)) {
  //   let aval = data[sender]["balance"]
  //   if (aval > amnt) {
  //     data[reciver]["balance"] += amnt;
  //     data[reciver]["history"].push({
  //       typeOfTransaction: "Credit",
  //       amount: amnt
  //     })
  //     data[sender]["balance"] -= amnt;
  //     let balance=data[sender]["balance"]
  //     data[sender]["history"].push({
  //       typeOfTransaction: "Debit",
  //       amount: amnt
  //     })
  //     res.send({balance:balance,message: "Transfer " + amnt + "Rs is successfull" })
  //   }
  //    else {
  //     res.status(400).send({ message: "Insufficent balance to transfer" });
  //   }
  // } else {
  //   res.status(401).send({ message: "Invalid Receiver" });

  // }

});
// router.get('/user', function (req, res, next) {

// });
module.exports = router;
