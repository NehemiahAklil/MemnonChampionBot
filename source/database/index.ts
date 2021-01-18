import models from './models';
import db from './connection';
db.then(({ connections }) => {
  console.log(`Connected to ${connections[0].name}`);
}).catch((err) => console.log(err));

export default models;
