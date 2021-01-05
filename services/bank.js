const { User } = require('../models/user');
// const { use } = require('../routes');
function getUsers() {
   return User.find({ })
   .then(users=>{
       if(users){
           return{
               statusCode:200,
               users:users
           }
       }
   })
}
function addUser(username, password, acntno) {
    return User.findOne({
        username
    })
        .then(user => {
            if (user) {
                return {
                    statusCode: 400,
                    message: "Account Already Exist!"
                }
            }
            const newUser = new User({
                username, password, acntno, history: [], balance: 0
            });
            newUser.save();
            return {
                statusCode: 200,
                message: "Registration Successfull"
            }
        });
    // data[username] = { username,password,acntno,history: [], balance: 0 };

}
function login(username, password) {
    return User.findOne({
        username,
        password
    })
        .then(user => {
            if (user) {
                return {
                    statusCode: 200,
                    message: "Login Success",
                    username: username
                };
            } else {
                return {
                    statusCode: 400,
                    message: "Invalid Credentials"
                }
            }
        })
}
function deposit(username, amount) {
    return User.findOne({
        username
    })
        .then(user => {
            if (user) {
                user.balance += amount;
                let bal = user.balance;
                user.history.push({
                    typeOfTransaction: "Credit",
                    amount: amount
                });
                user.save();
                return {
                    statusCode: 200,
                    balance: bal,
                    message: "Deposit Successfully",
                }
            }
            return {
                statusCode: 400,
                message: "Invalid user"
            }

        })

}
function withraw(username, amount) {
    return User.findOne({
        username,
    })
        .then(user => {
            if (user) {
                let avbal = user.balance;
                if (avbal < amount) {
                    return {
                        statusCode: 400,
                        message: "Insufficent Balance!",
                        balance: avbal
                    }
                }
                user.balance -= amount;
                let bal = user.balance;
                user.history.push({
                    typeOfTransaction: "Debit",
                    amount: amount
                });
                user.save();
                return {
                    statusCode: 200,
                    balance: bal,
                    message: "Withrawel Successfully",
                }
            }
            return {
                statusCode: 400,
                message: "Invalid user"
            }

        })

}
function trashist(username) {
    return User.findOne({
        username
    })
        .then(user => {
            if (user) {
                return {
                    statusCode: 200,
                    history: user.history
                }
            }
            else {
                return {
                    statusCode: 400,
                    message: "Inavalid User"
                }
            }
        })
}
function deleteUser(id){
    return User.deleteOne({
        _id:id
    })
    .then(data=>{
        return{statusCode:200,message:"User Deleted Suessfully"}
    })
}
// function setCurrentUser(username) {
//     currentUser = username;
// }
// function getCurrentUser() {
//     return currentUser;
// }

module.exports = {
    getUsers,
    addUser,
    login,
    deposit,
    withraw,
    trashist,
    deleteUser,
    // setCurrentUser: setCurrentUser,
    // getCurrentUser: getCurrentUser,
}