require('dotenv').config();
const { createApp } = require('../my-app/api/app');
const port = process.env.PORT || 3002;
createApp().listen(port, () => console.log(`API listening on http://localhost:${port}`));
