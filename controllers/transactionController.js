const Transaction = require("../model/Transaction");

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate("product");
    const transactionsWithDetails = transactions.map(transaction => ({
      ...transaction._doc,
      staffName: `${transaction.staffName} (${transaction.staffRole})`,
      oldProductDetails: transaction.oldProductDetails,
      newProductDetails: transaction.newProductDetails,
    }));
    res.json(transactionsWithDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { getTransactions };
