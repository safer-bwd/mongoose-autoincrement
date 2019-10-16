import set from 'lodash.set';
import get from 'lodash.get';
import makeCounter from './counter/make';

let Counter;

const getAutoIncrementFields = (schema) => {
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
  const { counterName = '__Counter' } = options || {};
  Counter = makeCounter(counterName);

  const fields = getAutoIncrementFields(schema);

  schema.pre('save', async function (next) {
    const doc = this;
    const { modelName } = doc.constructor;

    const promises = fields.map(async (field) => {
      const { path } = field;
      let value = get(doc, path);
      if (doc.isNew && !value) {
        value = await Counter.getNext(modelName, path);
        set(doc, path, value);
      } else {
        if (Number.isInteger(Number(value))) {
          await Counter.shiftCurrent(modelName, path, Number(value));
        }
      }
    });
    await Promise.all(promises);

    next();
  });
};
