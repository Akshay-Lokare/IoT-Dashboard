const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deveui: {
    type: String,
    required: true,
  },
  creatorId: {
    type: String, // email of the user
    required: true,
  },
  locationTags: {
    type: [String], // array of 4 location tags
    validate: [arr => arr.length <= 4, '{PATH} exceeds the limit of 4'],
    default: [],
  },
  device_type: {
    type: String,
    required: true,
  },
  record_type: {
    type: String,
    required: true,
  },
  payload: {
    type: String, // hexadecimal string from the device
    required: true,
  },
  fcount: {
    type: Number,
    default: 0, // number of events triggered by the device
  },
  location: {
    type: String,
    required: true,
  },
  createDate: {
    type: Date,
    default: Date.now, // MongoDB will automatically store this timestamp
  }
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
