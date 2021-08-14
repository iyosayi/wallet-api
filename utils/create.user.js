// Authentication
const faker = require("faker");
const User = require("../wallet-api/models/user.model");
const Wallet = require("../wallet-api/models/wallet.model");

async function createUser(shouldCreate = false, userDetails) {
  if (shouldCreate) {
    const user = new User(userDetails);
    await user.save();
    const wallet = new Wallet({ user: user._id });
    await wallet.save();
    user.walletId = wallet._id
    await user.save()
    return user;
  }
  return null;
}

// OBJECT COMPOSITION
const makeFakeUser = (overrides) => {
  const user = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    accountNumber: faker.random.alphaNumeric(),
  };
  return { ...user, ...overrides };
};

module.exports = { createUser, makeFakeUser };
