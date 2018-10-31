import mongoose from 'mongoose';

const env = 'development';
const config = require('./config')[env];

module.exports = () => {
  mongoose.Promise = global.Promise;
  const db = mongoose.connect(config.db, { useNewUrlParser: true });
  // eslint-disable-next-line
  mongoose.connection.on('error', (err) => {
    console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
  }).on('open', () => {
    console.log('Connection extablised with MongoDB');
  });
  return db;
};
