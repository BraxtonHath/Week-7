const mongoose = require('mongoose');

const activitiesSchema = new mongoose.Schema({
  activityName: {type: String, unique: true},
  data: [{
    date: {
      type: Date,
      default: Date.now
    },
    number: Number
  }]
});

const Activities = mongoose.model('Activities', activitiesSchema);

module.exports = Activities;
