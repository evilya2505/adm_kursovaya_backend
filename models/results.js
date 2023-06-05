const mongoose = require("mongoose");

// --- Описание схемы фильма ---
const resultSchema = new mongoose.Schema({
  firstText: {
    type: String,
    required: true,
  },
  secondText: {
    type: String,
    required: true,
  },
  levenshteinDistance: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

module.exports = mongoose.model("result", resultSchema);
