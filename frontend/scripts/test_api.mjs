// Test script for verifying the API endpoints
async function test() {
  console.log('--- Testing POST /api/google-reverse ---');
  const reverseRes = await fetch('http://localhost:5173/api/google-reverse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'alex_rivera.jpg',
      fileHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    }),
  });

  const reverseData = await reverseRes.json();
  console.log('Google Reverse Response Status:', reverseRes.status);
  console.log('Google Reverse Data:', reverseData);

  console.log('\n--- Testing POST /api/face-search ---');
  const dummyEmbedding = new Array(128).fill(0.088);
  const searchRes = await fetch('http://localhost:5173/api/face-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blockchainHash: reverseData.blockchainHash,
      faceEmbeddingVector: dummyEmbedding,
      fileName: 'alex_rivera.jpg',
      timestamp: new Date().toISOString(),
    }),
  });

  const searchData = await searchRes.json();
  console.log('Face Search Response Status:', searchRes.status);
  console.log('Face Search Data:', searchData);

  if (reverseRes.ok && searchRes.ok && searchData.success) {
    console.log('\n>>> All API endpoints PASSED successfully! <<<');
  } else {
    console.error('\n>>> API endpoint test FAILED! <<<');
    process.exit(1);
  }
}

test().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
