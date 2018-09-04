var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', authenticationMiddleware(), function(req, res, next) {
  const db = require('../db');

  db.query('SELECT * FROM mahasiswa', function(err, results) {
    if(err) throw err;
    console.log('test');

    res.render('mahasiswa/mahasiswa', {
      title: 'Daftar Mahasiswa',
      results: results
    });
  });
});

router.get('/edit/:nrp', authenticationMiddleware(), function(req, res, next){
  const db = require('../db');

  db.query('SELECT * FROM mahasiswa WHERE nrp = ?',[req.params.nrp],function(err, results, fields) {
    if(err) throw err;
    
    res.render('mahasiswa/edit_mahasiswa', { title: 'Edit Data', results: results});
  })
});

router.post('/edit/:nrp', authenticationMiddleware(), function(req, res, next){
  req.checkBody('nama', 'nama field cannot be empty.').notEmpty();
  req.checkBody('nama', 'nama must be between 4-15 characters long.').len(4, 15);
  req.checkBody('nrp', 'NRP must be 14 characters long.').len(14);
  req.checkBody('angkatan', 'Tahun angkatan must be 4 characters long.').len(4);
  
  const errors = req.validationErrors();

  if(errors){
    res.render('mahasiswa/edit_mahasiswa', {
      title: 'Edit Mahasiswa',
      errors: errors
    });
  } else{
    const nrp = req.body.nrp;
    const nama = req.body.nama;
    const angkatan = req.body.angkatan;

    const db = require('../db');
    db.query('UPDATE mahasiswa SET nrp = ?, nama = ?, angkatan = ? WHERE nrp = ?', [nrp, nama, angkatan, req.params.nrp], function(err) {
      if(err) throw err;

      res.redirect('/mahasiswa');
    });
  }
});

router.get('/delete/:nrp', authenticationMiddleware(), function(req, res, next){
  const db = require('../db');

  db.query('DELETE FROM mahasiswa WHERE nrp = ?',[req.params.nrp],function(err, results) {
    if(err) throw err;
    res.redirect('/mahasiswa');
  })
});

router.get('/tambah', authenticationMiddleware(), function(req, res, next){
  res.render('mahasiswa/tambah_mahasiswa', { title: 'Tambah Mahasiswa' });
});

router.post('/tambah', authenticationMiddleware(), function(req, res, next){
  req.checkBody('nama', 'nama field cannot be empty.').notEmpty();
  req.checkBody('nama', 'nama must be between 4-15 characters long.').len(4, 15);
  req.checkBody('nrp', 'NRP must be 14 characters long.').len(14);
  req.checkBody('angkatan', 'Tahun angkatan must be 4 characters long.').len(4);

  const errors = req.validationErrors();

  if(errors){
    res.render('mahasiswa/tambah_mahasiswa', {
      title: 'Tambah Mahasiswa',
      errors: errors
    });
  } else{
    const nrp = req.body.nrp;
    const nama = req.body.nama;
    const angkatan = req.body.angkatan;

    const db = require('../db');
    db.query('INSERT INTO mahasiswa (nrp, nama, angkatan) VALUES(?, ?, ?)', [nrp, nama, angkatan], function(err) {
      if(err) throw err;

      res.render('mahasiswa/tambah_mahasiswa', {
        title: 'Tambah Mahasiswa',
        complete: 'true'
      });
    })
  }
});

function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
}
module.exports = router;
