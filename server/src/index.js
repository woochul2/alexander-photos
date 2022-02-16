const app = require('./app');
const db = require('./database');

db.connect();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}.`);
});
