import set from 'lodash.set';
import get from 'lodash.get';
import makeCounter from './counter/make';

const getAutoincrementFields = (schema) => {
  const fields = [];

  schema.eachPath((path, schematype) => {
    const { options } = schematype;
    const { autoincrement, type } = options;
    const isValidType = (type === Number || type === String);
    if (autoincrement && isValidType) {
      fields.push({ path, options });
    }
  });

  return fields;
};

export default (schema, options) => {
  const fields = getAutoincrementFields(schema);
  if (fields.length === 0) {
    return;
  }

  const { counterName = '__Autoincrement_Counter' } = options || {};
  const Counter = makeCounter(counterName);
  schema.static('getCounterModel', () => Counter);

  async function preSave(next) {
    const doc = this;
    const { modelName } = doc.constructor;
    const promises = fields.map(async (field) => {
      const { path } = field;
      const curValue = Number(get(doc, path));
      if (doc.isNew && !curValue) {
        const newValue = await Counter.getNext(modelName, path);
        set(doc, path, newValue);
      } else if (doc.isModified(path) && Number.isInteger(curValue)) {
        await Counter.shiftCurrent(modelName, path, Number(curValue));
      }
    });

    await Promise.all(promises);
    next();
  }

  schema.pre('save', preSave);

  const mutableFields = fields.filter(field => !field.options.immutable);
  if (mutableFields.length === 0) {
    return;
  }

  async function preUpdate(next) {
    const query = this;
    const { modelName } = query.model;

    const promises = mutableFields.map(async (field) => {
      const { path } = field;
      const changedValue = Number(query.get(path));
      if (Number.isInteger(Number(changedValue))) {
        await Counter.shiftCurrent(modelName, path, Number(changedValue));
      }
    });

    await Promise.all(promises);
    next();
  }

  schema.pre('findOneAndUpdate', preUpdate);
  schema.pre('updateOne', preUpdate);
  schema.pre('updateMany', preUpdate);
  schema.pre('update', preUpdate); // deprecated
};
