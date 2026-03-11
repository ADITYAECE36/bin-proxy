const express = require('express');
const app = express();

app.use(express.json());

const SUPABASE_URL = 'https://fmirjzxdqerqrqfacpgv.supabase.co';
const SUPABASE_KEY = 'your-anon-key-here'; // ← paste your anon key

app.get('/', (req, res) => {
  res.json({ status: 'online', message: '🚀 Bin Proxy Running!' });
});

app.post('/api/data', async (req, res) => {
  console.log('📥 Received:', req.body);

  const { bin_id, distance_cm, fill_level, status } = req.body;

  if (!bin_id) {
    return res.status(400).json({ error: 'Missing bin_id' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bin_data`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':         SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify({ bin_id, distance_cm, fill_level, status })
    });

    if (response.status === 201 || response.status === 200) {
      console.log('✅ Saved! BIN:', bin_id);
      return res.status(200).json({ success: true });
    } else {
      const err = await response.text();
      return res.status(400).json({ error: err });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});