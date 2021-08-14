const { Schema, model } = require("mongoose");
const userModel = new Schema(
  {
    firstName: String,
    lastname: String,
    email: String,
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
  },
  { timestamps: true }
);

const User = model("User", userModel);
module.exports = User;
