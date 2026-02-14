const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ===============================
   ADD TRANSACTION
================================= */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   GET TRANSACTIONS (Pagination + Search + Filter)
================================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const search = req.query.search;
    const category = req.query.category;

    let filter = { userId: req.user.id };

    if (search && search.trim() !== "") {
      filter.title = { $regex: search, $options: "i" };
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      total,
      page,
      transactions
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   UPDATE TRANSACTION
================================= */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updatedTransaction);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   DELETE TRANSACTION
================================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({ message: "Transaction deleted" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

/* ===============================
   DASHBOARD SUMMARY
================================= */
router.get("/dashboard/summary", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user.id
    });

    const totalExpense = transactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const categoryBreakdown = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const recentTransactions = await Transaction.find({
      userId: req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalExpense,
      categoryBreakdown,
      recentTransactions
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
