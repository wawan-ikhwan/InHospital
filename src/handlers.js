/* eslint-disable max-len */
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789abcdef', 16);
const bcrypt = require('bcrypt'); // untuk hashing
const users = require('./users.json'); // data pengguna
const patients = require('./patients.json'); // data pasien
const updateUsers = require('./updateUsers'); // fungsi untuk mengupdate JSON pengguna
const updatePatients = require('./updatePatients'); // fungsi untuk mengupdate JSON pasien

function indexHandler(request, h) {
  let response = '<h3>Ini adalah halaman index. Anda belum <a href="./login">login</a>.<h3>';
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi);
  if (userIndex !== -1) {
    response = `ini adalah index page. Anda sudah login. Selamat datang ${users[userIndex].previlege} ${users[userIndex].name}`;
  }
  return h.response(response);
}

function registerHandler(request, h) {
  let response = '<html><head><title>Register Page</title></head><body><h3>Register</h3><form method="post" action="./register">Username: <input type="text" name="username"><br>Password: <input type="password" name="password"><br/><input type="submit" value="Register"></form></body></html>';
  if (request.method === 'post') { // Cek jika client menggunakan method post.
    const { username, password } = request.payload; // mendapatkan data username dan passowrd dari client
    const berhasilDaftar = (username.length >= 4 && password.length >= 8 && !username.includes(' ')); // cek validasi data
    if (berhasilDaftar) { // jika data valid
      users.push({ // masukkan data baru dari array users
        name: username,
        pw: bcrypt.hashSync(password, 10), // jangan lupa dicrypt karena keamanan data adalah hal yang penting
        sesi: 'null',
        previlege: 'pengunjung',
      });
      updateUsers(users); // mengupdate file users.json ke data yang terbaru
      response = 'data sukses didaftarkan!, kembali ke <a href="/login">login</a>';
    } else {
      response = 'data gagal di<a href="/register">daftar</a>kan!<br>username minimal 4 tanpa whitespace dan password minimal 8';
    }
  }
  return h.response(response);
}

function loginHandler(request, h) {
  let response = '<html><head><title>Login Page</title></head><body><h3>Log In</h3><form method="post" action="./login">Username: <input type="text" name="username"><br>Password: <input type="password" name="password"><br/><input type="submit" value="Login"></form><a href="/register">Daftar</a></body></html>';

  if (request.method === 'post') { // jika method adalah post
    const { username, password } = request.payload; // ambil username dan password dari client
    const berhasilLogin = users.find((user) => user.name === username && bcrypt.compareSync(password, user.pw)); // cek validasi auth
    if (berhasilLogin) {
      const randomCookieGen = nanoid(); // atur cookie secara random
      h.state('sesi', randomCookieGen, { // sesi adalah nama kuki yang tersimpan di browser
        ttl: 60000 * 60 * 1, // kadaluarsa kuki dalam milisecond
        isSecure: false,
      });
      const currentUserIndex = users.findIndex((user) => user.name === username); // ambil posisi user saat ini dari index users
      users[currentUserIndex].sesi = randomCookieGen; // atur sesi user saat ini
      updateUsers(users); // update file users.json
      response = 'login berhasil, kembali ke <a href="/">menu</a>.';
    } else {
      response = '<a href="/login">login</a> gagal';
    }
  }

  return h.response(response);
}

function logoutHandler(request, h) {
  return h.response('bye').unstate('sesi'); // jika user logout
}

function createPatientHandler(request, h) {
  let response = 'pasien gagal ditambah!';
  const {
    nama, umur, ruangan, penyakit,
  } = request.payload; // ambil data pasien dari client
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi); // mengecek siapakah user saat ini
  if (userIndex === -1) { // jika tidak ada user yang memenuhi
    return h.response('autentikasi dibutuhkan!').code(401);
  }
  const allowedPrevileges = 'admin dokter perawat'; // previlege yang diizinkan untuk menambahkan pasien
  const { previlege } = users[userIndex];
  const isPrevilegeAllowed = allowedPrevileges.includes(previlege);
  if (!isPrevilegeAllowed) { // jika tidak diizinkan
    return h.response('anda tidak diizinkan!').code(405);
  }

  const isDataPasienValid = (nama.length > 0 && umur.length > 0 && ruangan.length > 0 && penyakit.length > 0 && isPrevilegeAllowed);
  if (isDataPasienValid) { // mengecek apakah inputan user itu valid
    patients.push({
      id: nanoid(),
      entry: new Date().toString(),
      name: nama,
      age: umur,
      room: ruangan,
      disease: penyakit,
    });
    updatePatients(patients); // mengupdate file patients.json
    response = `${nama} berhasil ditambah!`;
  }
  return h.response(response);
}

function readPatientHandler(request, h) { // mendapatkan semua data pasien
  let response = 'pasien gagal didapat!';
  const { nama } = request.query;
  let filter = false;
  if (nama !== '' && nama !== undefined) { // cek jika ada parameter
    filter = true;
  }
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi); // mengecek siapakah user saat ini berdasarkan sesi
  if (userIndex === -1) { // jika tidak ada sesi kuki yang memenuhi
    return h.response('autentikasi dibutuhkan!').code(401);
  }
  const allowedPrevileges = 'admin dokter perawat'; // hak akses yang boleh mengunjungi patient
  const { previlege } = users[userIndex]; // mengambil previlege user
  const isPrevilegeAllowed = allowedPrevileges.includes(previlege);
  if (!isPrevilegeAllowed) { // jika tidak diizinkan
    return h.response('anda tidak diizinkan!').code(405);
  }
  if (filter) {
    const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(nama.toLowerCase())); // semua pembanding menjadi lowercase
    response = filteredPatients;
  } else {
    response = patients; // ubah respon menjadi pasien
  }
  return h.response(response);
}

function readSpecifyPatientHandler(request, h) {
  let response = 'pasien gagal didapat!';
  const { id } = request.params;
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi); // mengecek siapakah user saat ini berdasarkan sesi
  if (userIndex === -1) { // jika tidak ada sesi kuki yang memenuhi
    return h.response('autentikasi dibutuhkan!').code(401);
  }
  const allowedPrevileges = 'admin dokter perawat pengunjung'; // hak akses yang boleh mengunjungi patient
  const { previlege } = users[userIndex]; // mengambil previlege user
  const isPrevilegeAllowed = allowedPrevileges.includes(previlege);
  if (!isPrevilegeAllowed) { // jika tidak diizinkan
    return h.response('anda tidak diizinkan!').code(405);
  }

  const patientIndex = patients.findIndex((patient) => patient.id === id); // cek pasien mana yang mau dilihat datanya
  if (patientIndex === -1) { // jika tidak ada pasien
    return h.response('id pasien tidak ditemukan');
  }

  response = patients[patientIndex]; // ubah respon menjadi pasien
  return h.response(response);
}

function updatePatientHandler(request, h) {
  let response = 'pasien gagal diubah!';
  const {
    nama, umur, ruangan, penyakit,
  } = request.payload; // ambil data dari client
  const { id } = request.params; // ubah pasien berdasarkan ID
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi); // cek siapakah user saat ini
  if (userIndex === -1) { // jika tidak ada user
    return h.response('autentikasi dibutuhkan!').code(401);
  }
  const allowedPrevileges = 'admin dokter perawat'; // cek apakah user memiliki hak akses untuk merubah data
  const { previlege } = users[userIndex];
  const isPrevilegeAllowed = allowedPrevileges.includes(previlege);
  if (!isPrevilegeAllowed) { // jika tidak diizinkan
    return h.response('anda tidak diizinkan!').code(405);
  }

  const patientIndex = patients.findIndex((patient) => patient.id === id); // cek pasien mana yang mau diubah datanya
  if (patientIndex === -1) { // jika tidak ada pasien
    return h.response('id pasien tidak ditemukan');
  }

  // Blok kode dibawah ini berfungsi untuk mempertahankan nilai asal jika beberapa request.payload tidak ada.
  const keepNama = (nama !== undefined && nama !== '') ? nama : patients[patientIndex].name;
  const keepUmur = (umur !== undefined && umur !== '') ? umur : patients[patientIndex].age;
  const keepRuangan = (ruangan !== undefined && ruangan !== '') ? ruangan : patients[patientIndex].room;
  const keepPenyakit = (penyakit !== undefined && penyakit !== '') ? penyakit : patients[patientIndex].disease;

  // cek apakah ada data pasien yang berubah
  const isDataPasienInvalid = keepNama === patients[patientIndex].name && keepUmur === patients[patientIndex].age && keepRuangan === patients[patientIndex].room && keepPenyakit === patients[patientIndex].disease;

  if (isDataPasienInvalid) { // jika tidak sah karena tidak ada perubahan data.
    return h.response('data pasien invalid!').code(400);
  }

  patients[patientIndex] = { // update pasien di index yang diketahui
    id,
    entry: new Date().toString(),
    name: keepNama,
    age: keepUmur,
    room: keepRuangan,
    disease: keepPenyakit,
  };
  updatePatients(patients); // update file patients.json
  response = `${patients[patientIndex].name} berhasil diubah!`;
  return h.response(response);
}

function deletePatientHandler(request, h) {
  let response = 'pasien gagal dihapus!';
  const { id } = request.params; // hapus pasien berdasarkan ID
  const userIndex = users.findIndex((user) => user.sesi === request.state.sesi); // cek siapakah user saat ini
  if (userIndex === -1) { // jika tidak ada user
    return h.response('autentikasi dibutuhkan!').code(401);
  }
  const allowedPrevileges = 'admin dokter perawat'; // hak akses yang boleh menghapus
  const { previlege } = users[userIndex]; // lihat previlege user saat ini
  const isPrevilegeAllowed = allowedPrevileges.includes(previlege);
  if (!isPrevilegeAllowed) { // jika tidak diizinkan
    return h.response('anda tidak diizinkan!').code(405);
  }

  const patientIndex = patients.findIndex((patient) => patient.id === id); // cek pasien mana yang mau diambil berdasarkan ID
  if (patientIndex === -1) { // jika tidak ada pasien yang memenuhi
    return h.response('id pasien tidak ditemukan');
  }
  patients.splice(patientIndex, 1); // fungsi hapus elemen pada array berdasarkan index
  updatePatients(patients); // update perubahan file patients.json setelah dihapus
  response = 'berhasil dihapus!';
  return h.response(response);
}

module.exports = {
  indexHandler,
  registerHandler,
  loginHandler,
  logoutHandler,
  createPatientHandler,
  readPatientHandler,
  readSpecifyPatientHandler,
  updatePatientHandler,
  deletePatientHandler,
};
