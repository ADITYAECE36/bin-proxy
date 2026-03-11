const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const SUPABASE_URL = 'https://fmirjzxdqerqrqfacpgv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtaXJqenhkcWVycXJxZmFjcGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTIwNDgsImV4cCI6MjA4ODc4ODA0OH0.txIajKaJp6hM0QrWdKCaIyHeZXxif2OnoW7k2G1WK9Y'; // ← your real anon key

app.get('/', (req, res) => {
  res.json({ status: 'online', message: '🚀 Bin Proxy Running!' });
});

// ✅ GET endpoint — ESP32 sends data via GET request!
app.get('/data', async (req, res) => {
  const { bin_id, distance_cm, fill_level, status } = req.query;

  console.log('📥 Received GET:', req.query);

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
      body: JSON.stringify({
        bin_id,
        distance_cm: parseFloat(distance_cm),
        fill_level:  parseFloat(fill_level),
        status
      })
    });

    if (response.status === 201 || response.status === 200) {
      console.log('✅ Saved! BIN:', bin_id);
      return res.status(200).send('OK');  // ✅ Simple response for ESP32
    } else {
      const err = await response.text();
      console.log('❌ Error:', err);
      return res.status(400).send('FAIL');
    }
  } catch (error) {
    console.log('❌ Server error:', error.message);
    return res.status(500).send('ERROR');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});