const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: {
    type: String,

    unique: true,
    required: true,
    minlength: 3,
  },
  favouriteGenre: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", schema);