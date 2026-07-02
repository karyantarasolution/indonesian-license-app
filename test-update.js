const http = require('http');

const putData = JSON.stringify({
  is_applicant_edit: true,
  files: JSON.stringify([{name: "test.jpg", url: "test"}])
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/mysql/licenses/1', // assuming ID 1 exists, but maybe it doesn't.
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(putData)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', (e) => console.error(e));
req.write(putData);
req.end();
