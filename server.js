const express = require('express');
const app = express();

// ── Body parsing ──────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── CORS headers ──────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ── Supabase credentials ──────────────────────────
const SUPABASE_URL = 'https://fmirjzxdqerqrqfacpgv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtaXJqenhkcWVycXJxZmFjcGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTIwNDgsImV4cCI6MjA4ODc4ODA0OH0.txIajKaJp6hM0QrWdKCaIyHeZXxif2OnoW7k2G1WK9Y'; // ← paste your anon key

// ── Health check ──────────────────────────────────
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: '🚀 Bin Proxy Running!' 
  });
});

// ── Receive data from ESP32 ───────────────────────
app.post('/api/data', async (req, res) => {
  console.log('📥 Raw body received:', req.body);

  // Handle both parsed and string body
  let data = req.body;
  if (typeof data === 'string') {
    try { 
      data = JSON.parse(data); 
    } catch (e) { 
      console.log('❌ JSON parse error:', e.message);
      return res.status(400).json({ error: 'Invalid JSON' }); 
    }
  }

  const { bin_id, distance_cm, fill_level, status } = data;
  console.log('📦 Parsed data:', { bin_id, distance_cm, fill_level, status });

  // Validate required fields
  if (!bin_id) {
    console.log('❌ Missing bin_id');
    return res.status(400).json({ error: 'Missing bin_id' });
  }

  try {
    // Forward to Supabase
    console.log('📤 Sending to Supabase...');
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
        distance_cm, 
        fill_level, 
        status 
      })
    });

    console.log('📩 Supabase response status:', response.status);

    if (response.status === 201 || response.status === 200) {
      console.log('✅ Data saved! BIN:', bin_id);
      return res.status(200).json({ 
        success: true,
        message: `BIN ${bin_id} data saved!`
      });
    } else {
      const err = await response.text();
      console.log('❌ Supabase error:', err);
      return res.status(400).json({ error: err });
    }

  } catch (error) {
    console.log('❌ Server error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ── Start server ──────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
});