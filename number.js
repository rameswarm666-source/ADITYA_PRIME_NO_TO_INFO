const fetch = require('node-fetch');
const validateApiKey = require('./_lib/validateKey');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.setHeader('Access-Control-Expose-Headers', 'X-API-Key-Valid');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use GET or POST.' 
    });
  }

  try {
    // API Key प्राप्त करें
    let apiKey;
    if (req.headers['x-api-key']) {
      apiKey = req.headers['x-api-key'];
    } else if (req.query.key) {
      apiKey = req.query.key;
    } else if (req.body && req.body.key) {
      apiKey = req.body.key;
    }

    // Number प्राप्त करें
    let number;
    if (req.method === 'GET') {
      number = req.query.number;
    } else {
      number = req.body?.number;
    }

    if (!number) {
      return res.status(400).json({ 
        success: false,
        error: 'Number parameter is required'
      });
    }

    const cleanNumber = number.toString().replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid number format. Please provide a 10-digit number.' 
      });
    }

    if (!apiKey) {
      return res.status(401).json({ 
        success: false,
        error: 'API key is required'
      });
    }

    const isValidKey = validateApiKey(apiKey);
    res.setHeader('X-API-Key-Valid', isValidKey ? 'true' : 'false');

    if (!isValidKey) {
      return res.status(403).json({ 
        success: false,
        error: 'Invalid API key',
        provided_key: apiKey
      });
    }

    // Original API call
    const originalApiUrl = `https://api.paanel.shop/numapi.php?action=api&key=haxkerz&number=${cleanNumber}`;
    const response = await fetch(originalApiUrl);
    
    if (!response.ok) {
      throw new Error(`Original API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      number: cleanNumber,
      key_valid: true,
      timestamp: new Date().toISOString(),
      source: "Vercel Proxy API",
      record_count: data.length,
      data: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch data from original API',
      message: error.message
    });
  }
};