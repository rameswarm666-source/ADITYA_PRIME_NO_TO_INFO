const validateApiKey = (providedKey) => {
  const validKey = process.env.API_KEY || 'aditya';
  
  console.log('Validating key:', {
    provided: providedKey,
    valid: validKey,
    match: providedKey === validKey
  });
  
  return providedKey === validKey;
};

module.exports = validateApiKey;