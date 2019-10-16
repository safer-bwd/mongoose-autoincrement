import mongoose from 'mongoose';
import autoIncrementPlugin from '../src';

beforeAll(async () => {
  await mongoose.connect(process.env.DB_MONGO_URI, {
    auth: (process.env.DB_MONGO_USER) ? {
      user: process.env.DB_MONGO_USER,
      password: process.env.DB_MONGO_PASSWORD
    } : null,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  delete mongoose.models.Order;
  await mongoose.connection.dropDatabase();
});

it('should auto increment field', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: Number,
      immutable: true,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();
  const order2 = new Order();
  await order2.save();
  const order3 = new Order();
  await order3.save();

  expect(order1.number).toBe(1);
  expect(order2.number).toBe(2);
  expect(order3.number).toBe(3);
});

it('should change counter if field has changed #1 (save)', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: Number,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  order1.number = 10;
  await order1.save();
  const foundOrder = await Order.findOne();
  expect(foundOrder.number).toBe(10);

  const order2 = new Order();
  await order2.save();
  expect(order2.number).toBe(11);
});

it('should change counter if field has changed #2 (findOneAndUpdate)', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: Number,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();

  await Order.findOneAndUpdate({ number: 1 }, {
    number: 10
  });

  const order2 = new Order();
  await order2.save();
  expect(order2.number).toBe(11);

  await Order.findOneAndUpdate({ number: 10 }, {
    $set: { number: 20 }
  });

  const order3 = new Order();
  await order3.save();
  expect(order3.number).toBe(21);
});

it('should change counter if field has changed #3 (updateOne)', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: Number,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();

  await Order.updateOne({ number: 1 }, {
    number: 10
  });

  const order2 = new Order();
  await order2.save();
  expect(order2.number).toBe(11);

  await Order.updateOne({ number: 10 }, {
    $set: { number: 20 }
  });

  const order3 = new Order();
  await order3.save();
  expect(order3.number).toBe(21);
});

it('should change counter if field has changed #4 (update)', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: Number,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();

  await Order.update({ number: 1 }, {
    number: 10
  });

  const order2 = new Order();
  await order2.save();
  expect(order2.number).toBe(11);

  await Order.update({ number: 10 }, {
    $set: { number: 20 }
  });

  const order3 = new Order();
  await order3.save();
  expect(order3.number).toBe(21);
});

it('should change counter if field has changed #5 (updateMany)', async () => {
  const schema = new mongoose.Schema({
    number: {
      type: Number,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();

  await Order.updateMany({ number: 1 }, {
    number: 10
  });

  const order2 = new Order();
  await order2.save();
  expect(order2.number).toBe(11);

  await Order.updateMany({ number: 10 }, {
    $set: { number: 20 }
  });

  const order3 = new Order();
  await order3.save();
  expect(order3.number).toBe(21);
});
