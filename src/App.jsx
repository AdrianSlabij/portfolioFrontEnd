import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css"; // Import the new CSS file

// --- Configuration ---
const API_URL =
  "https://p3ztqsgahh.execute-api.us-east-2.amazonaws.com/portfolio";

// --- Helper Components ---

const Header = () => (
  <header className="app-header">
    <h1>My AI-Powered Portfolio Monitor</h1>
  </header>
);

const DashboardMetrics = ({ totalValue }) => (
  <div className="metric-card">
    <h2>Total Portfolio Value</h2>
    <p className="total-value-text">
      $
      {totalValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </p>
  </div>
);

const HoldingsChart = ({ holdings }) => {
  const chartData = holdings.map((h) => ({
    name: h.ticker,
    value: h.totalValue,
  }));
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#ff4d4d",
  ];

  if (holdings.length === 0) {
    return (
      <div className="chart-container empty-chart">
        <p>No data available for chart.</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h2>Asset Allocation</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const HoldingsTable = ({ holdings, onRemove }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (ticker) => {
    setExpandedRow(expandedRow === ticker ? null : ticker);
  };

  if (holdings.length === 0) {
    return (
      <p className="empty-holdings-message">
        You have no holdings in your portfolio.
      </p>
    );
  }

  return (
    <div className="card">
      <h2>Your Holdings</h2>
      <div className="table-wrapper">
        <table className="holdings-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Quantity</th>
              <th>Current Price</th>
              <th>Total Value</th>
              <th>Percent Change</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <React.Fragment key={holding.ticker}>
                <tr>
                  <td className="ticker-cell">{holding.ticker}</td>
                  <td>{holding.quantity}</td>
                  <td>${holding.currentPrice.toFixed(2)}</td>
                  <td className="value-cell">
                    ${holding.totalValue.toFixed(2)}
                  </td>
                  <td
                    className={`value-cell ${holding.percentChange > 0 ? "text-positive" : holding.percentChange < 0 ? "text-negative" : ""}`}
                  >
                    {holding.percentChange > 0 ? "+" : ""}
                    {holding.percentChange.toFixed(2)}%
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => toggleRow(holding.ticker)}
                      className="button-link"
                    >
                      {expandedRow === holding.ticker
                        ? "Hide AI Note"
                        : "Show AI Note"}
                    </button>
                    <button
                      onClick={() => onRemove(holding.ticker)}
                      className="button-danger"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
                {expandedRow === holding.ticker && (
                  <tr className="ai-note-row">
                    <td colSpan="5">
                      <div className="ai-note-content">
                        <p className="ai-note-header">
                          AI Analyst Note (
                          {new Date(holding.timestamp).toLocaleString()}):
                        </p>
                        <p className="ai-note-body">{holding.explanation}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AddHoldingForm = ({ onAdd, setIsLoading }) => {
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticker || !quantity || parseFloat(quantity) <= 0) {
      alert("Please enter a valid ticker and quantity.");
      return;
    }

    console.log("Form submitted with:", {
      ticker,
      quantity: parseFloat(quantity),
    });
    setIsLoading(true);
    await onAdd(ticker, parseFloat(quantity));
    setTicker("");
    setQuantity("");
  };

  return (
    <div className="card">
      <h2>Add or Update Holding</h2>
      <form onSubmit={handleSubmit} className="add-holding-form">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Ticker (e.g., AAPL)"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />
        <button type="submit" className="button-primary">
          Save Holding
        </button>
      </form>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [portfolioData, setPortfolioData] = useState({
    holdings: [],
    totalValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPortfolioData(data);
    } catch (e) {
      setError(e.message);
      console.error("Failed to fetch portfolio data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateHolding = async (ticker, quantity) => {
    console.log("handleUpdateHolding called with:", { ticker, quantity });
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, quantity }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to update holding.");
      alert(result.message);
      fetchData();
    } catch (e) {
      setError(e.message);
      console.error("Failed to update holding:", e);
      alert(`Error: ${e.message}`);
      setIsLoading(false);
    }
  };

  const handleRemoveHolding = (ticker) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${ticker} from your portfolio?`
      )
    ) {
      handleUpdateHolding(ticker, 0);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {isLoading && (
          <p className="loading-message">Loading portfolio data...</p>
        )}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !error && (
          <>
            <div className="dashboard-grid">
              <DashboardMetrics totalValue={portfolioData.totalValue} />
              <HoldingsChart holdings={portfolioData.holdings} />
            </div>
            <AddHoldingForm
              onAdd={handleUpdateHolding}
              setIsLoading={setIsLoading}
            />
            <HoldingsTable
              holdings={portfolioData.holdings}
              onRemove={handleRemoveHolding}
            />
          </>
        )}
      </main>
    </div>
  );
}
