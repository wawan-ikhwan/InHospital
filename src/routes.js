const {
  indexHandler,
  registerHandler,
  loginHandler,
  logoutHandler,
  createPatientHandler,
  readPatientHandler,
  readSpecifyPatientHandler,
  updatePatientHandler,
  deletePatientHandler,
} = require('./handlers');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: indexHandler,
  },
  {
    method: ['GET', 'POST'],
    path: '/register',
    handler: registerHandler,
  },
  {
    method: ['GET', 'POST'],
    path: '/login',
    handler: loginHandler,
  },
  {
    method: 'GET',
    path: '/logout',
    handler: logoutHandler,
  },
  {
    method: 'POST',
    path: '/patient',
    handler: createPatientHandler,
  },
  {
    method: 'GET',
    path: '/patient',
    handler: readPatientHandler,
  },
  {
    method: 'GET',
    path: '/patient/{id}',
    handler: readSpecifyPatientHandler,
  },
  {
    method: 'PUT',
    path: '/patient/{id}',
    handler: updatePatientHandler,
  },
  {
    method: 'DELETE',
    path: '/patient/{id}',
    handler: deletePatientHandler,
  },
];

module.exports = routes;
