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

it('should auto increment field #1', async () => {
  const schema = new mongoose.Schema({
    code: {
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

  expect(order1.code).toBe(1);
  expect(order2.code).toBe(2);
  expect(order3.code).toBe(3);
});

it('should auto increment field #2', async () => {
  const schema = new mongoose.Schema({
    code: {
      type: String,
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

  expect(order1.code).toBe('1');
  expect(order2.code).toBe('2');
  expect(order3.code).toBe('3');
});

it('should shift counter if field changed by save() #1', async () => {
  const schema = new mongoose.Schema({
    code: {
      type: Number,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();

  order1.code = 10;
  await order1.save();
  const foundOrder = await Order.findOne();
  expect(foundOrder.code).toBe(10);

  const order2 = new Order();
  await order2.save();
  expect(order2.code).toBe(11);
});

it('should shift counter if field changed by save() #2', async () => {
  const schema = new mongoose.Schema({
    code: {
      type: String,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();

  order1.code = '10';
  await order1.save();
  const foundOrder = await Order.findOne();
  expect(foundOrder.code).toBe('10');

  const order2 = new Order();
  await order2.save();
  expect(order2.code).toBe('11');
});

it('should shift counter if field changed by findOneAndUpdate()', async () => {
  const schema = new mongoose.Schema({
    code: {
      type: Number,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();

  await Order.findOneAndUpdate({ code: 1 }, {
    code: 10
  });

  const order2 = new Order();
  await order2.save();
  expect(order2.code).toBe(11);

  await Order.findOneAndUpdate({ code: 10 }, {
    $set: { code: 20 }
  });

  const order3 = new Order();
  await order3.save();
  expect(order3.code).toBe(21);
});

it('should shift counter if field changed by updateOne()', async () => {
  const schema = new mongoose.Schema({
    code: {
      type: Number,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();

  await Order.updateOne({ code: 1 }, {
    code: 10
  });

  const order2 = new Order();
  await order2.save();
  expect(order2.code).toBe(11);

  await Order.updateOne({ code: 10 }, {
    $set: { code: 20 }
  });

  const order3 = new Order();
  await order3.save();
  expect(order3.code).toBe(21);
});

it('should shift counter if field changed by update()', async () => {
  const schema = new mongoose.Schema({
    code: {
      type: Number,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();

  await Order.update({ code: 1 }, {
    code: 10
  });

  const order2 = new Order();
  await order2.save();
  expect(order2.code).toBe(11);

  await Order.update({ code: 10 }, {
    $set: { code: 20 }
  });

  const order3 = new Order();
  await order3.save();
  expect(order3.code).toBe(21);
});

it('should shift counter if field changed by updateMany()', async () => {
  const schema = new mongoose.Schema({
    code: {
      type: Number,
      autoincrement: true
    }
  });
  schema.plugin(autoIncrementPlugin);
  const Order = mongoose.model('Order', schema);

  const order1 = new Order();
  await order1.save();

  await Order.updateMany({ code: 1 }, {
    code: 10
  });

  const order2 = new Order();
  await order2.save();
  expect(order2.code).toBe(11);

  await Order.updateMany({ code: 10 }, {
    $set: { code: 20 }
  });

  const order3 = new Order();
  await order3.save();
  expect(order3.code).toBe(21);
});
