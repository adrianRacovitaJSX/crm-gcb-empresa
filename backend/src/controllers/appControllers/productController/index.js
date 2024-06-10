const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

const read = require('./read');
const search = require('./search');
const listAll = require('./listAll');

function modelController() {
  const Model = mongoose.model('Product');
  const methods = createCRUDController('Product');
  methods.read = (req, res) => read(Model, req, res);
  methods.listAll = (req, res) => listAll(Model, req, res);
  methods.search = (req, res) => search(Model, req, res);
  return methods;
}

module.exports = modelController();
