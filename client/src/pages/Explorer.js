import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Explorer() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Food");
  const [editId, setEditId] = useState(null);

  const limit = 5;

  const fetchTransactions = async () => {
    try {
      let url = `/transactions?page=${page}&limit=${limit}`;

      if (search !== "") url += `&search=${search}`;
      if (category !== "All") url += `&category=${category}`;

      const res = await API.get(url);

      setTransactions(res.data.transactions || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.log(error);
      setTransactions([]);
      setTotal(0);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    if (!title || !amount) return;

    if (editId) {
      await API.put(`/transactions/${editId}`, {
        title,
        amount: Number(amount),
        category: newCategory
      });
      setEditId(null);
    } else {
      await API.post("/transactions", {
        title,
        amount: Number(amount),
        category: newCategory,
        date: new Date()
      });
    }

    setTitle("");
    setAmount("");
    setNewCategory("Food");

    fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, search, category]);

  return (
    <div>
      <Navbar />
      <h2>Transaction Explorer</h2>

      <h3>{editId ? "Edit Transaction" : "Add Transaction"}</h3>

      <form onSubmit={handleAddTransaction}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        >
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Rent">Rent</option>
        </select>

        <button type="submit">
          {editId ? "Update" : "Add"}
        </button>
      </form>

      <hr />

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      <select
        value={category}
        onChange={(e) => {
          setPage(1);
          setCategory(e.target.value);
        }}
      >
        <option value="All">All</option>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Rent">Rent</option>
      </select>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul>
          {transactions.map((t) => (
            <li key={t._id}>
              {t.title} - ₹{t.amount} - {t.category}

              <button
                onClick={() => {
                  setTitle(t.title);
                  setAmount(t.amount);
                  setNewCategory(t.category);
                  setEditId(t._id);
                }}
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  await API.delete(`/transactions/${t._id}`);
                  fetchTransactions();
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span> Page {page} </span>

        <button
          disabled={page * limit >= total}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Explorer;
