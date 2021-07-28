const {
  indexHandler,
  registerHandler,
  loginHandler,
  logoutHandler,
  createPatientHandler,
  readPatientHandler,
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
    method: 'PUT',
    path: '/patient',
    handler: updatePatientHandler,
  },
  {
    method: 'DELETE',
    path: '/patient',
    handler: deletePatientHandler,
  },
];

module.exports = routes;
