/**
 * 1) Authentication
 * 2) Fund account with card or bank transfer
 * 3) Send money to other user
 * 4) Add beneficiaries
 * 5) withdraw money to beneficiaries
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const Wallet = require("./models/wallet.model");
const { createUser, makeFakeUser } = require("../utils/create.user");
const { transactionType, walletTransaction } = require("../utils/type");
const { PaystackService } = require("../utils/paystack");

//Create connection
mongoose
  .connect("mongodb://localhost:27017/bola")
  .then(() => console.log("Mongodb connected"))
  .catch((err) => console.log("error connecting", err));

const app = express();
app.use(express.json());
/**
 * 1) When a user signs up,
 * 2) they type their account number,
 * 3) based on the account number entered (make sure you validate) you hit the `verifyAccountNumber` endpoint
 * 4) update the user's wallet name to tally with the account name -- optional
 */
app.post("/pay", async (req, res) => {
  const { amount, email, type } = req.body;
  const user = await User.findOne({ email });
  const metadata = JSON.stringify({
    firstName: user.firstName,
    walletId: user.walletId,
    email: user.email,
    id: user._id,
    direction: type,
  });
  const transaction = await transactionType[type].initializeTransfer({
    amount,
    email,
    metadata,
  });

  res.json({
    status: true,
    data: transaction.authorization_url,
  });
});

app.post("/verify", async (req, res) => {
  const {
    amount,
    metadata: { email, direction },
  } = req.body.data;
  const user = await User.findOne({ email });
  const wallet = await Wallet.findById(user.walletId);
  const transaction = await walletTransaction[direction]({
    amount,
    walletId: wallet._id,
  });
  console.log("Transaction", transaction);
});

app.post("/transfer", async (req, res) => {
  const { accountNumber, bankCode, email, amount, reason, type } = req.body;
  // get my wallet balance and make sure it is > 0
  // 1) Verify account number
  const user = await User.findOne({ email });
  const wallet = await Wallet.findOne({ user: user._id });
  const verified = await PaystackService.verifyAccountNumber({
    accountNumber,
    bankCode,
  });

  console.log({ verified });

  if (verified && Object.keys(verified).length <= 0) {
    throw Error("Invalid account information");
  }

  if (wallet.balance < amount) {
    throw new Error("Insufficient funds");
  }
  // create transfer recipient
  const transferRecipient = await PaystackService.createTransferRecipient({
    account_number: accountNumber,
    bank_code: bankCode,
  });
  console.log({ transferRecipient });
  // 3) Inititate transfer
  const transfer = await PaystackService.transfer({
    reason,
    amount,
    recipient: transferRecipient,
  });
  const final = await walletTransaction[type]({ amount, walletId: wallet._id });
  console.log("USER BALANCE AFTER DEBIT", final);
  console.log({ transfer });
});

createUser(
  false,
  makeFakeUser()
).then((res) => console.log("RES", res));

app.listen(5000, () => console.log("listening on port 5000"));
