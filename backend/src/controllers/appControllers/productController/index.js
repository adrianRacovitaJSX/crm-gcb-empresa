const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const read = require('./read');
const search = require('./search');

const listAll = require('./listAll');

function modelController() {
  const modelName = 'Product';
  const Model = mongoose.model(modelName);
  const methods = createCRUDController(modelName);
  methods.read = (req, res) => read(Model, req, res);
  methods.search = (req, res) => search(Model, req, res);
  methods.listAll = (req, res) => listAll(Model, req, res);
  return methods;
}

module.exports = modelController();
