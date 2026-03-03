const { Router } = require('express');
const router = Router();

/**
 * Mocked stock data for LG Electronics (KRX: 066570).
 */
function getStockMock() {
  const today = new Date();
  const series = [];
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Simulate KRW price around 85,000–95,000 range
    const price = 85000 + Math.sin(i / 10) * 4000 + (90 - i) * 88;
    series.push({
      date: d.toISOString().split('T')[0],
      price: Math.round(price),
    });
  }
  return {
    ticker: 'KRX:066570',
    last_price: series[series.length - 1].price,
    change_90d_pct: 9.4,
    currency: 'KRW',
    series,
  };
}

/**
 * Mocked news items based on real LG Electronics headlines.
 */
function getNewsMock() {
  return [
    { id: 'news-1', title: 'LG Electronics Reports Record Revenue for Second Consecutive Year', date: '2026-01-28', source: 'Reuters', summary: 'FY2025 revenue reached 89.2 trillion KRW with operating profit of 2.48 trillion KRW, driven by subscription growth and premium product mix.' },
    { id: 'news-2', title: 'LG Showcases Affectionate Intelligence at CES 2026', date: '2026-01-07', source: 'The Verge', summary: 'CLOiD humanoid robot, OLED evo W6 Wallpaper TV, and AI Cabin Platform headline LG\'s CES presence under the AI in Action theme.' },
    { id: 'news-3', title: 'LG Unveils Next-Gen Smart Telematics at MWC Barcelona', date: '2026-02-24', source: 'Bloomberg', summary: 'New integrated TCU-antenna telematics module debuts as LG maintains number one global market share at 23 percent.' },
    { id: 'news-4', title: 'LG Acquires Majority Stake in Bear Robotics', date: '2025-01-15', source: 'TechCrunch', summary: 'LG takes 51 percent stake in Silicon Valley robotics startup to bolster commercial and home robotics capabilities.' },
    { id: 'news-5', title: 'New CEO Lyu Jae-cheol Takes Helm at LG Electronics', date: '2025-12-01', source: 'Nikkei Asia', summary: 'Former Home Appliance Solution Company head succeeds William Cho as CEO, signaling focus on AI transformation and qualitative growth.' },
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
