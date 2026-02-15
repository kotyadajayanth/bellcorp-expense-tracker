import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";



function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.get("/transactions/dashboard/summary");
        setSummary(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchSummary();
  }, []);

  if (!summary) return <h3>Loading...</h3>;

  return (
  <div>
    <Navbar />
    <h2>Dashboard</h2>


      <h3>Total Expense: ₹{summary.totalExpense}</h3>

      <h4>Category Breakdown:</h4>
      <ul>
        {Object.entries(summary.categoryBreakdown).map(([key, value]) => (
          <li key={key}>
            {key}: ₹{value}
          </li>
        ))}
      </ul>

      <h4>Recent Transactions:</h4>
      <ul>
        {summary.recentTransactions.map((t) => (
          <li key={t._id}>
            {t.title} - ₹{t.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
