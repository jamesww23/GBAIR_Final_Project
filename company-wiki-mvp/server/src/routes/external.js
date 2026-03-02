const { Router } = require('express');
const router = Router();

/**
 * Mocked stock data for Nexus Dynamics (NXDY).
 */
function getStockMock() {
  const today = new Date();
  const series = [];
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const price = 128 + Math.sin(i / 10) * 12 + (90 - i) * 0.16;
    series.push({
      date: d.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
    });
  }
  return {
    ticker: 'NXDY',
    last_price: series[series.length - 1].price,
    change_90d_pct: 12.3,
    series,
  };
}

/**
 * Mocked news items.
 */
function getNewsMock() {
  return [
    { id: 'news-1', title: 'Nexus Dynamics Reports Record Q3 Revenue', date: '2026-01-15', source: 'TechCrunch', summary: 'The company exceeded analyst expectations with strong growth in its cloud and AI segments.' },
    { id: 'news-2', title: 'Nexus Dynamics Expands APAC Operations', date: '2026-01-28', source: 'Bloomberg', summary: 'New offices in Tokyo and Singapore signal aggressive international growth strategy.' },
    { id: 'news-3', title: 'AI-Powered Customer Service Wins Industry Award', date: '2026-02-05', source: 'VentureBeat', summary: 'Project Aurora recognized for innovation in automated customer support solutions.' },
    { id: 'news-4', title: 'Nexus Dynamics Partners with Major Retailer', date: '2026-02-14', source: 'Reuters', summary: 'Strategic partnership to deploy manufacturing automation across 200 retail distribution centers.' },
    { id: 'news-5', title: 'Quarterly Earnings Call Scheduled for March 10', date: '2026-02-28', source: 'MarketWatch', summary: 'Investors anticipate continued momentum following strong hiring and product launches.' },
  ];
}

router.get('/stock', (_req, res) => {
  res.json(getStockMock());
});

router.get('/news', (_req, res) => {
  res.json(getNewsMock());
});

module.exports = router;
module.exports.getStockMock = getStockMock;
module.exports.getNewsMock = getNewsMock;
