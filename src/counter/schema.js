import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  path: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  count: {
    type: Number,
    required: false,
    default: 0
  }
}, { id: false });

schema.index({
  model: 1,
  path: 1
}, { unique: true });

schema.statics.getNext = async function (model, path) {
  const Counter = this;
  const update = { $inc: { count: 1 } };
  const counter = await Counter.updateCurrent(model, path, update);
  return counter.count;
};

schema.statics.getCurrent = async function (model, path) {
  const Counter = this;
  const counter = await Counter.findOne({ model, path });
  return counter ? counter.count : 0;
};

schema.statics.setCurrent = async function (model, path, value) {
  const Counter = this;
  const update = { count: value };
  await Counter.updateCurrent(model, path, update);
};

schema.statics.shiftCurrent = async function (model, path, value) {
  const Counter = this;
  const update = { $max: { count: value } };
  await Counter.updateCurrent(model, path, update);
};

schema.statics.updateCurrent = async function (model, path, update) {
  const Counter = this;
  const filter = { model, path };

  let counter;
  try {
    counter = await Counter.findOneAndUpdate(filter, update, { upsert: true, new: true });
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      counter = await Counter.findOneAndUpdate(filter, update, { new: true });
    } else {
      throw err;
    }
  }

  return counter;
};

export default schema;
