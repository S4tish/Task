const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Database to store the fetched data
let database = [];

// API to initialize the database with seed data
app.get('/api/initializeDatabase', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    database = response.data;
    res.status(200).json({ message: 'Successfully initialized' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  }
});

// API for statistics
app.get('/api/statistics', (req, res) => {
  const month = req.query.month;

  const filteredData = database.filter((item) => item.dateOfSale.includes(month));
  const totalSaleAmount = filteredData.reduce((total, item) => total + item.saleAmount, 0);
  const totalSoldItems = filteredData.length;
  const totalNotSoldItems = database.length - filteredData.length;

  res.status(200).json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
});

// API for bar chart
app.get('/api/barChart', (req, res) => {
  const month = req.query.month;

  const filteredData = database.filter((item) => item.dateOfSale.includes(month));

  const priceRanges = {
    '0-100': 0,
    '101-200': 0,
    '201-300': 0,
    '301-400': 0,
    '401-500': 0,
    '501-600': 0,
    '601-700': 0,
    '701-800': 0,
    '801-900': 0,
    '901-above': 0,
  };

  filteredData.forEach((item) => {
    const price = item.price;
    if (price >= 0 && price <= 100) {
      priceRanges['0-100']++;
    } else if (price >= 101 && price <= 200) {
      priceRanges['101-200']++;
    } else if (price >= 201 && price <= 300) {
      priceRanges['201-300']++;
    } else if (price >= 301 && price <= 400) {
      priceRanges['301-400']++;
    } else if (price >= 401 && price <= 500) {
      priceRanges['401-500']++;
    } else if (price >= 501 && price <= 600) {
      priceRanges['501-600']++;
    } else if (price >= 601 && price <= 700) {
      priceRanges['601-700']++;
    } else if (price >= 701 && price <= 800) {
      priceRanges['701-800']++;
    } else if (price >= 801 && price <= 900) {
      priceRanges['801-900']++;
    } else if (price >= 901) {
      priceRanges['901-above']++;
    }
  });

  res.status(200).json(priceRanges);
});

// API for pie chart
app.get('/api/pieChart', (req, res) => {
  const month = req.query.month;
  
  const filteredData = database.filter((item) => item.dateOfSale.includes(month));

  const categoryCounts = {};
  filteredData.forEach((item) => {
    const category = item.category;
    if (categoryCounts[category]) {
      categoryCounts[category]++;
    } else {
      categoryCounts[category] = 1;
    }
  });

  res.status(200).json(categoryCounts);
});

// API to fetch combined data from all the APIs
app.get('/api/combinedData', async (req, res) => {
  const month = req.query.month;

  try {
    const [statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
      axios.get(`http://localhost:3000/api/statistics?month=${month}`),
      axios.get(`http://localhost:3000/api/bar-chart?month=${month}`),
      axios.get(`http://localhost:3000/api/pie-chart?month=${month}`),
    ]);

    const combinedData = {
      statistics: statisticsResponse.data,
      barChart: barChartResponse.data,
      pieChart: pieChartResponse.data,
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch combined data' });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
