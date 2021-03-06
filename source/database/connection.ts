import config from 'config';
import mongoose from 'mongoose';
const mongoUrl: string = config.get('mongoUrl');

const dbConfigs = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
};
console.log('Trying to connect to mongo url', mongoUrl);
export default mongoose.connect(mongoUrl, dbConfigs);
