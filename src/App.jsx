import reactLogo from "./assets/react.svg";
import "./App.css";
import React, { useState, useEffect, useCallback } from "react";

const API_URL =
  "https://p3ztqsgahh.execute-api.us-east-2.amazonaws.com/portfolio";

// portfolio_data.append({
//
//                 'ticker': ticker,
//                 'quantity': quantity,
//                 'currentPrice': current_price,
//                 'totalValue': item_value,
//                 'timestamp': latest_history.get('timestamp', 'N/A'),
//                 'explanation': latest_history.get('explanation', 'No analysis available.')
//
//             })

const HoldingsTable = ({ holdings }) => {
  return (
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Ticker
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Quantity
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Current Price
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Total Value
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Percent Change
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Timestamp
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Explanation
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {holdings.map((holding) => (
          <tr key={holding.id} class="hover:bg-gray-100 dark:hover:bg-gray-600">
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
              {holding.ticker}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
              {holding.quantity}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
              {holding.currentPrice}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
              {holding.totalValue}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
              {holding.percentChange}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
              {holding.timestamp}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
              {holding.explanation}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function App() {
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

  return (
    <div>
      <div className="sticky top-0 bg-gray-900/80 backdrop-blur-lg py-4 z-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Portfolio Monitoring
        </h1>
        <p className="text-gray-400 mt-1">
          Welcome back, here's your portfolio snapshot.
        </p>
      </div>
      <HoldingsTable holdings={portfolioData.holdings}></HoldingsTable>
    </div>

    // <div className="App">
    //   <header className="App-header">
    //     {/* <img src={reactLogo} className="logo react" alt="React logo" /> */}

    //   </header>
    // </div>
  );
}
export default App;
