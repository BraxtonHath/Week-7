const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const parseurl = require('parseurl');
const Activities = require('./models/activities');
const Users = require('./models/users');
const passport = require("passport");
const BasicStrategy = require("passport-http").BasicStrategy;


mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/braxton');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));




passport.use(new BasicStrategy(
  function(username, password, done) {
    Users.findOne({username: username, password: password}).then(function(user) {
      if(!user) {
        return done(null, false);
      } else {
        return done(null, username);
      }
    });
  }
));

// app.use(function(req, res, next) {
//   passport.authenticate('basic', {session: false});
//   next();
// });
 //info for postman to chck things
// const users = new Users({
//   username: 'Braxton',
//   password: '1234'
// });
// users.save();

// const activity = new Activities({
//   activityName: 'Running a mile',
//   data: [{
//     amount: 5
//   }]
// });
// activity.save();


//get,post,patch,delete
// all the activities
app.get('/api/activities', passport.authenticate('basic', {session: false}), function(req, res) {
  Activities.find({}).then(function(results) {
    res.json(results);
  });
});



// make new thing to track
app.post('/api/activities', passport.authenticate('basic', {session: false}), function(req, res) {
  const activity = new Activities({
    activityName: req.body.activityName
  }).save().then(function(result) {
    var data = {date: req.body.data[0].date, number: req.body.data[0].number};
    result.data.push(data);
    result.save().then(function() {
      res.json({});
    });
  });
});




// show the task selected
app.get('/api/activities/:id', passport.authenticate('basic', {session: false}), function(req, res) {
  var id = req.params.id;
 Activities.findOne({_id: id}).then(function(result) {
    res.json(result);
 });
});




// update a task
app.patch('/api/activities/:id', passport.authenticate('basic', {session: false}), function(req, res) {
  var id = req.params.id;
  var newActivity = req.body.activityName;
  var message = '';
 Activities.findOne({_id: id}).then(function(result) {
   if (req.body.activityName) {
     result.activityName = req.body.activityName;
     result.save();
     res.json(result);
   } else {
     message = 'Need a new activity';
     res.status(404).json(message);
   }
 });
});

// delete task
app.delete('/api/activities/:id', passport.authenticate('basic', {session: false}), function(req, res) {
  var id = req.params.id;
  Activities.deleteOne({_id: id}).then(function() {
    res.json({});
  });
});

// add data for the day to update info and stuff
app.post('/api/activities/:id/stats', passport.authenticate('basic', {session: false}), function(req, res) {
  var id = req.params.id;
  var newDate = req.body.date;
  var newDateObject = new Date(newDate);
  var newnumber = req.body.number;

  Activities.findOne({_id: id}).then(function(item) {
    for(var i = 0; i < item.data.length; i++) {
      var dbDate = item.data[i].date;
      if (dbDate.getTime() === newDateObject.getTime()) {
        item.data[i].number = newnumber;
        item.save().then(function() {
          res.json(item);
        });
        return;
      } else {
        item.data.push({
          date: newDate,
          number: newnumber
        });
        item.save().then(function(){
          res.json({});
        });
        return;
      }
    }
  });
});

// delete the days data
app.delete('/api/stats/:id', passport.authenticate('basic', {session: false}), function(req, res) {
  var id = req.params.id;
  var dataId = req.body.dataId;
  Activities.update({_id: id}, {$pull: {data: {_id: dataId}}}).then(function(result) {
    res.json(result);
  });
});


app.listen(3000, function() {
  console.log('successfully initiated express application');
});
