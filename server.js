const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let items = [
  { id: '1', name: 'Apples', category: 'Produce', quantity: 6, bought: false, createdAt: new Date().toISOString() },
  { id: '2', name: 'Whole Milk', category: 'Dairy', quantity: 1, bought: false, createdAt: new Date().toISOString() },
  { id: '3', name: 'Sourdough Bread', category: 'Bakery', quantity: 1, bought: true, createdAt: new Date().toISOString() }
];

function suggestCategory(name) {
  const lower = name.toLowerCase();
  if (/\b(apple|banana|orange|grape|tomato|potato|onion|lettuce|berry|avocado|carrot|spinach)\b/.test(lower)) return 'Produce';
  if (/\b(milk|cheese|yogurt|butter|cream|egg|eggs)\b/.test(lower)) return 'Dairy';
  if (/\b(bread|bagel|croissant|muffin|cake|pastry)\b/.test(lower)) return 'Bakery';
  if (/\b(chicken|beef|pork|steak|bacon|fish|salmon|meat)\b/.test(lower)) return 'Meat & Seafood';
  if (/\b(rice|pasta|cereal|flour|sugar|oil|sauce|can|soup|spice)\b/.test(lower)) return 'Pantry';
  if (/\b(water|juice|soda|coffee|tea|beer|wine)\b/.test(lower)) return 'Beverages';
  if (/\b(soap|paper|towel|cleaner|detergent|trash|tissue)\b/.test(lower)) return 'Household';
  return 'Other';
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/items', (req, res) => {
  res.json(items);
});

app.post('/api/items', (req, res) => {
  const { name, category, quantity } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  const newItem = {
    id: Date.now().toString(),
    name: name.trim(),
    category: category && category.trim() ? category.trim() : suggestCategory(name),
    quantity: Math.max(1, parseInt(quantity) || 1),
    bought: false,
    createdAt: new Date().toISOString()
  };

  items.unshift(newItem);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const { name, category, quantity, bought } = req.body;
  if (name !== undefined) items[index].name = name.trim();
  if (category !== undefined) items[index].category = category.trim();
  if (quantity !== undefined) items[index].quantity = Math.max(1, parseInt(quantity) || 1);
  if (bought !== undefined) items[index].bought = Boolean(bought);

  res.json(items[index]);
});

app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = items.length;
  items = items.filter(item => item.id !== id);

  if (items.length === initialLen) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json({ success: true, id });
});

app.delete('/api/items', (req, res) => {
  const beforeCount = items.length;
  items = items.filter(item => !item.bought);
  res.json({ success: true, removedCount: beforeCount - items.length });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Smart Shopping List server running on port ${PORT}`);
});