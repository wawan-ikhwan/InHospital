const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789abcdef', 16);
const bcrypt = require('bcrypt');
const users = require('./users.json');
const patients = require('./patients.json');
const updateUsers = require('./updateUsers');
const updatePatients = require('./updatePatients');

function indexHandler(request, h) {
  let response = 'ini adalah index page. Anda belum login.';
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi);
  if (userIndex !== -1) {
    response = `ini adalah index page. Anda sudah login. Selamat datang ${users[userIndex].previlege} ${users[userIndex].name}`;
  }
  return h.response(response);
}

function registerHandler(request, h) {
  let response = '<html><head><title>Register Page</title></head><body><h3>Register</h3><form method="post" action="./register">Username: <input type="text" name="username"><br>Password: <input type="password" name="password"><br/><input type="submit" value="Register"></form></body></html>';
  if (request.method === 'post') {
    const { username, password } = request.payload;
    const berhasilDaftar = (username.length >= 4 && password.length >= 8);
    if (berhasilDaftar) {
      users.push({
        name: username,
        pw: bcrypt.hashSync(password, 10),
        sesi: 'null',
        previlege: 'pengunjung',
      });
      updateUsers(users);
      response = 'data sukses didaftarkan!';
    } else {
      response = 'data gagal didaftarkan!<br>username minimal 4 dan password minimal 8';
    }
  }
  return h.response(response);
}

function loginHandler(request, h) {
  let response = '<html><head><title>Login Page</title></head><body><h3>Log In</h3><form method="post" action="./login">Username: <input type="text" name="username"><br>Password: <input type="password" name="password"><br/><input type="submit" value="Login"></form></body></html>';

  if (request.method === 'post') {
    const { username, password } = request.payload;
    // eslint-disable-next-line max-len
    const berhasilLogin = users.find((user) => user.name === username && bcrypt.compareSync(password, user.pw));
    if (berhasilLogin) {
      const randomCookieGen = nanoid();
      h.state('sesi', randomCookieGen, {
        ttl: 10000,
        isSecure: false,
      });
      const currentUserIndex = users.findIndex((user) => user.name === username);
      users[currentUserIndex].sesi = randomCookieGen;
      updateUsers(users);
      response = 'login berhasil';
    } else {
      response = 'login gagal';
    }
  }

  return h.response(response);
}

function logoutHandler(request, h) {
  return h.response('bye').unstate('sesi');
}

function createPatientHandler(request, h) {
  let response = 'pasien gagal ditambah!';
  const {
    nama, umur, ruangan, penyakit,
  } = request.payload;
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi);
  if (userIndex === -1) {
    return h.response('autentikasi dibutuhkan!').code(401);
  }
  const allowedPrevileges = 'admin dokter perawat';
  const { previlege } = users[userIndex];
  const isPrevilegeAllowed = allowedPrevileges.includes(previlege);
  if (!isPrevilegeAllowed) {
    return h.response('anda tidak diizinkan!').code(405);
  }
  // eslint-disable-next-line max-len
  const isDataPasienValid = (nama.length > 0 && umur.length > 0 && ruangan.length > 0 && penyakit.length > 0 && isPrevilegeAllowed);
  if (isDataPasienValid) {
    patients.push({
      id: nanoid(),
      entry: new Date().toString(),
      name: nama,
      age: umur,
      room: ruangan,
      disease: penyakit,
    });
    updatePatients(patients);
    response = `${nama} berhasil ditambah!`;
  }
  return h.response(response);
}

function readPatientHandler(request, h) {
  let response = 'pasien gagal didapat!';
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi);
  if (userIndex === -1) {
    return h.response('autentikasi dibutuhkan!').code(401);
  }
  const allowedPrevileges = 'admin dokter perawat';
  const { previlege } = users[userIndex];
  const isPrevilegeAllowed = allowedPrevileges.includes(previlege);
  if (!isPrevilegeAllowed) {
    return h.response('anda tidak diizinkan!').code(405);
  }
  updatePatients(patients);
  response = patients;
  return h.response(response);
}

function updatePatientHandler(request, h) {
  let response = 'pasien gagal diubah!';
  const {
    id, nama, umur, ruangan, penyakit,
  } = request.payload;
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi);
  if (userIndex === -1) {
    return h.response('autentikasi dibutuhkan!').code(401);
  }
  const allowedPrevileges = 'admin dokter perawat';
  const { previlege } = users[userIndex];
  const isPrevilegeAllowed = allowedPrevileges.includes(previlege);
  if (!isPrevilegeAllowed) {
    return h.response('anda tidak diizinkan!').code(405);
  }

  const patientIndex = patients.findIndex((patient) => patient.id === id);
  if (patientIndex === -1) {
    return h.response('id pasien tidak ditemukan');
  }
  patients[patientIndex] = {
    name: nama,
    age: umur,
    room: ruangan,
    disease: penyakit,
  };
  updatePatients(patients);
  response = `${patients[patientIndex].name} berhasil diubah!`;
  return h.response(response);
}

function deletePatientHandler(request, h) {
  let response = 'pasien gagal dihapus!';
  const { id } = request.payload;
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi);
  if (userIndex === -1) {
    return h.response('autentikasi dibutuhkan!').code(401);
  }
  const allowedPrevileges = 'admin dokter perawat';
  const { previlege } = users[userIndex];
  const isPrevilegeAllowed = allowedPrevileges.includes(previlege);
  if (!isPrevilegeAllowed) {
    return h.response('anda tidak diizinkan!').code(405);
  }

  const patientIndex = patients.findIndex((patient) => patient.id === id);
  if (patientIndex === -1) {
    return h.response('id pasien tidak ditemukan');
  }
  patients.splice(patientIndex, 1);
  updatePatients(patients);
  response = `${patients[patientIndex].name} berhasil dihapus!`;
  return h.response(response);
}

module.exports = {
  indexHandler,
  registerHandler,
  loginHandler,
  logoutHandler,
  createPatientHandler,
  readPatientHandler,
  updatePatientHandler,
  deletePatientHandler,
};
