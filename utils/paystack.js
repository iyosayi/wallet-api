const axios = require("axios").default;
require("dotenv").config();

const apiKey = process.env.PAYSTACK_SECRET_KEY;
module.exports.PaystackService = {
  createTransferRecipient: async (data) => {
    try {
      const response = await axios({
        url: `https://api.paystack.co/transferrecipient`,
        method: "post",
        data: {
          type: process.env.TRANSFER_TYPE || "nuban",
          currency: process.env.TRANSFER_CURRENCY || "NGN",
          ...data,
        },
        headers: { Authorization: apiKey, "Content-Type": "application/json" },
      });
      const {
        data: { recipient_code },
      } = response.data;
      return { recipient_code };
    } catch (error) {
      if (error.response.data) {
        return {
          status: error.response.data.status,
          message: error.response.data.message,
        };
      }
    }
  },
  initializeTransfer: async ({ amount, email, metadata }) => {
    const res = await axios({
      url: "https://api.paystack.co/transaction/initialize",
      method: "post",
      headers: {
        Authorization: process.env.PAYSTACK_SECRET_KEY,
        "Content-Type": "application/json",
      },
      data: {
        amount: amount * 100,
        email,
        metadata,
      },
    });
    const { authorization_url, reference } = res.data.data;
    return { authorization_url, reference };
  },
  verifyTransfer: async ({ reference }) => {
    const res = await axios({
      url: `https://api.paystack.co/transaction/verify/${reference}`,
      method: "get",
      headers: {
        Authorization: process.env.PAYSTACK_SECRET_KEY,
      },
    });
    return res.data.data;
  },
  verifyAccountNumber: async ({ accountNumber, bankCode }) => {
    const res = await axios({
      url: `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      method: "get",
      headers: {
        Authorization: apiKey,
      },
    });
    return res.data.data;
  },
  listBanks: async () => {
    const res = await axios({
      url: `https://api.paystack.co/bank?country=nigeria`,
      method: "get",
      headers: {
        Authorization: apiKey,
      },
    });
    return res.data.data;
  },
  transfer: async (data) => {
    const res = await axios({
      url: `https://api.paystack.co/transfer`,
      method: "post",
      headers: {
        Authorization: apiKey,
      },
      data: {
        source: "balance",
        ...data,
      },
    });
    return res.data.data;
  },
};
