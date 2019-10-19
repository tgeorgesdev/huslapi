
const express = require('express')
const under = require("underscore")
const router = express.Router();
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = "mongodb+srv://georges:1234@cluster0-rm0vl.mongodb.net/users?retryWrites=true&w=majority"
mongoose.set('useFindAndModify', false);


mongoose.connect(db,{useNewUrlParser: true},(err)=>{
if(err){
  console.log('The error is'+err)
} else {
  console.log('the databasee is connected')
}
})




//schema updates
/*User.update({},{
  $set: {stripe:[{  customer_id:"",  subscription_id:"" }]
}},
  {multi:true},
  function(error,values){
    if(error){
      console.log(error)
    } else {
      console.log(values)
    }
  }
)
*/

router.get('/user',(req,res)=>{
  let data = req.query;
  User.findOne({
    _id: data.id
  },(err,data)=>{
    if(err){
      res.status(401).send(err)
    } else {
      res.status(200).send(data)
    }
  })
})

router.post('/register',(req,res)=>{
let userData = req.body;
User.find({
  email: userData.email
},function(err,result){
 if(err){
    console.log(err)
 } else if(under._.isEmpty(result)){
   bcrypt.genSalt(saltRounds, function(err, salt) {
       bcrypt.hash(userData.password, salt, function(err, hash) {
         userData.password = hash;
         let user = new User(userData)
         user.save((error,registerUser)=>{
           if(error){
             console.log(error)
           } else {
             let payload = {
               subject: registerUser._id
             }
             let token = jwt.sign(payload,"secretKey")
             res.status(200).send({token,registerUser})
           }
         })
       });
   });
 } else {
   res.status(401).send('username already in use')
   }
})

})


router.post('/post',(req,res)=>{
  let jobdata = req.body;
  //console.log(jobdata)
  User.updateOne({
    _id:jobdata.poster_id
  },{$push: {postedJobs: jobdata}},function(err,result){
    if (err) {
      res.status(401).send(err)
    } else {
      if(result){
        res.status(200).send(result)
      }
    }
  })
})


router.post('/login',(req,res)=>{
  let userData = req.body;
  User.findOne({
    username: userData.username
  },function(error,user){
    if(error){
      console.log(error)
    } else {
      if(!user){
        res.status(401).send('Invalid username')
      } else {
        bcrypt.compare(userData.password, user.password).then(function(resp) {
          if(resp === false){
            res.status(401).send('Invalid password')
          } else {
            let payload = {
              subject: user._id
            }
            let token = jwt.sign(payload,"secretKey")
            res.status(200).send({token,user})
          }
});

      }
    }

  })

})


router.get('/nearme/',(req,res)=>{

 User.aggregate([
        {
            $geoNear: {
                near: {
                  type:'Point',
                  coordinates:[ parseFloat(req.query.long), parseFloat(req.query.lat)]
                },
                distanceField: "dist.calculated",
                maxDistance: parseFloat(req.query.distance)
            }
        }
    ]).then(function(results, err){
        res.send(results)
    });
});﻿

//job center api

router.get('/posted',(req,res)=>{
  let data = req.query;
  console.log(data)
  User.find({_id: data.id},(err,ob)=>{
    if(err){
      res.status(401).send(err)
    } else {
      res.status(200).send(ob[0].postedJobs)
    }
  })
})

router.delete('/postedDelete',(req,res)=>{
  let data = req.query;
  User.update({ _id: data.id }, { "$pull": { postedJobs: { _id: data.jobid } }}, { safe: true, multi:true }, function(err, obj) {
  if(err){
    res.status(401).send(err)
  } else {
    res.status(200).send("Job deleted")
  }
})
})

router.post('/appliedpost',(req,res)=>{
  let user = req.query;
  let job = req.body;
  User.updateOne({
    _id:user.id
  },{$push: {appliedJobs: job}},function(err,result){
    if (err) {
      res.status(401).send(err)
    } else {
      if(result){
        res.status(200).send(result)
      }
    }
  })
})

router.get('/appliedget',(req,res)=>{
  let data = req.query;
  console.log(data)
  User.find({_id: data.id},(err,ob)=>{
    if(err){
      res.status(401).send(err)
    } else {
      res.status(200).send(ob[0].appliedJobs)
    }
  })
})

router.put('/appliedupdate',(req,res)=>{
  console.log(req.body)
  User.update(
    { appliedJobs: {  _id: req.body.params.jobid  }}
  ,{completed:"true"},function(err,user){
    if(err){
      res.status(401).send(err)
    } else {
      res.status(200).send(user)
    }
  })
})

router.delete('/applieddelete',(req,res)=>{
  let data = req.query;
  User.update({ _id: data.id }, { "$pull": { appliedJobs: { _id: data.jobid } }}, { safe: true, multi:true }, function(err, obj) {
  if(err){
    res.status(401).send(err)
  } else {
    res.status(200).send("Job deleted")
  }
})
})

router.post('/completedpost',(req,res)=>{
  let user = req.query;
  let job = req.body;

  User.findOneAndUpdate({
    _id:user.id
  },{$push: {completedJobs: job}},{ new: true },function(err,result){
    if (err) {
      res.status(401).send(err)
    } else {
      if(result){
        res.status(200).send(result)
      }
    }
  })
})


router.get('/completedget',(req,res)=>{
  let data = req.query;
  console.log(data)
  User.find({_id: data.id},(err,ob)=>{
    if(err){
      res.status(401).send(err)
    } else {
      res.status(200).send(ob[0].completedJobs)
    }
  })
})

router.delete('/completeddelete',(req,res)=>{
  let data = req.query;
  User.update({ _id: data.id }, { "$pull": { completedJobs: { _id: data.jobid } }}, { safe: true, multi:true }, function(err, obj) {
  if(err){
    res.status(401).send(err)
  } else {
    res.status(200).send("Job deleted")
  }
})
})





router.put('/photoupdate',(req,res)=>{
  let data = req.body;

  User.findOneAndUpdate({
    _id: data.params.id
  },{$set:{ profile_photo: data.params.photo}},{ new: true },function(err,user){
    if(err){
      res.status(401).send(err)
    } else {
      res.status(200).send(user)
    }
  })
})

router.delete('/deleteaccount',(req,res)=>{
  console.log(req.query)
  User.remove({
    _id: req.query.id
  },function (err, user) {
      if(err){
        res.status(401).send(err)
      } else {
        res.status(200).send(user)
      }
        })
})

router.post('/reviewpost',(req,res)=>{
  data = req.body
  User.updateOne({
    _id:req.query.id
  },{$push: {reviews: data}},function(err,result){
    if(err){
      res.status(401).send(err)
    } else {
      res.status(200).send(result)

    }
  })
})

router.post('/applicantspost',(req,res)=>{
  applicant = req.body
  console.log(applicant)
  User.updateOne({
    _id:req.query.id
  },{$push: {applicants: applicant}},function(err,result){
    if(err){
      res.status(401).send(err)
    } else {
      res.status(200).send(result)

    }
  })
})

router.delete('/applicantsdelete',(req,res)=>{
console.log(req.query)
  User.updateOne({ _id: req.query.id }, { "$pull": { applicants: { _id: req.query.appid } }}, { safe: true, multi:true },function(err,resl){
    if(err){
      res.status(401).send(err)
    } else {
      res.status(200).send(resl)
    }

  })
})





//twilio
const accountSid = 'AC7fd0836062f3db2afe36f4610b6f073b';
const authToken = '025e6360b96628ed31da9ab1b606dbe1';
const client = require('twilio')(accountSid, authToken);
router.post('/message',(req,res)=>{
  data = req.query;
  console.log(req.query)
  console.log(req.body)
  client.messages
      .create({from: '+12512207526', body: req.body.msg, to: '+'+data.number})
      .then(message => console.log(message.sid));

})

//passowrd,email,number change




router.get('/checkpassword',(req,res)=>{
  let data = req.query;
  console.log(data)
  User.findOne({
    username: data.username
  },function(error,user){
  if(error){
    res.status(401).send(error)
  } else {
    bcrypt.compare(data.password, user.password).then(function(resp) {
      if(resp === false){
        res.status(401).send('Invalid password')
      } else {
        res.status(200).send(true)
      }
});
  }

  })
})


router.post('/changepassword',(req,res)=>{
  let userData = req.body;
  console.log(userData)
  bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(userData.password, salt, function(err, hash) {
        userData.password = hash;
        User.updateOne({
          username:userData.username
        },{password:userData.password},function(err,result){
          if (err) {
            res.status(401).send(err)
          } else {
            if(result){
              res.status(200).send(true)
            }
          }
        })
      });
  });


})


router.get('/checkemail',(req,res)=>{
  let data = req.query;
  console.log(data)
  User.findOne({
    username: data.username,
  },function(error,user){
  if(error){
    res.status(401).send(error)
  } else if(Object.is(user.email.trim(), data.email.trim())) {
    res.status(200).send(true)
  } else {
    res.status(404).send(false)
  }
})
  })


router.post('/changeemail',(req,res)=>{
  let userData = req.body;
  console.log(userData)
  User.updateOne({
    _id:userData.id
  },{email:userData.email},function(err,result){
    if (err) {
      res.status(401).send(err)
    } else {
      if(result){
        res.status(200).send(true)
      }
    }
  })
})

router.get('/checknumber',(req,res)=>{
  let data = req.query;
  User.findOne({
    username: data.username
  },function(error,user){
    if(error){
      res.status(401).send(error)
    } else if(Object.is(user.phone_number, parseInt(data.phone_number))) {
      res.status(200).send(true)
    } else {
      res.status(404).send(false)
    }
})
})

router.post('/changenumber',(req,res)=>{
  let userData = req.body;
  User.updateOne({
    _id:userData.id
  },{phone_number:userData.phone_number},function(err,result){
    if (err) {
      res.status(401).send(err)
    } else {
      if(result){
        res.status(200).send(true)
      }
    }
  })
})


module.exports = router;
