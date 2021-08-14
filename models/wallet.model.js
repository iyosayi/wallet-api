const { Schema, model } = require("mongoose");
const wallet = new Schema(
  {
    balance: { type: Schema.Types.Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    accountNumber: { type: Schema.Types.String },
    bankCode: { type: Schema.Types.String },
    transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
  },
  { timestamps: true }
);
const Wallet = model("Wallet", wallet);

wallet.path("balance").get((num) => +(num * 100).toFixed(2));
wallet.path("balance").set((num) => +(num / 100).toFixed(2));
module.exports = Wallet;
