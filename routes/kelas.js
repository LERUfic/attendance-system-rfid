var express = require('express');
var router = express.Router();

router.get('/', authenticationMiddleware(), function(req, res, next) {
    const db = require('../db');
    db.query('SELECT * FROM kelas', function(err, results) {
        if(err) throw err;
    
        res.render('kelas/kelas', {
          title: 'Daftar Kelas',
          list: results
        });
      });
});

router.get('/:id/tambah', function(req, res, next) {
    res.render('kelas/tambah_mahasiswa', { title: 'Tambahkan Mahasiswa ke Kelas', class_id: req.params.id});
});

router.post('/:id/tambah', function(req, res, next) {
    req.checkBody('nrp', 'NRP must be 14 characters long.').len(14);

    const errors = req.validationErrors();

    if(errors){
        res.render('kelas/tambah_mahasiswa', {
            title: 'Tambahkan Mahasiswa ke Kelas',
            errors: errors
        });
    } else {
        const nrp = req.body.nrp;
    
        const db = require('../db');
        db.query('INSERT INTO kelas_mahasiswa (student_id, class_id) SELECT * FROM (SELECT ?, ?) AS tmp WHERE NOT EXISTS (SELECT student_id FROM kelas_mahasiswa WHERE student_id = ?) LIMIT 1', [nrp, req.params.id, nrp], function(err) {
            if(err) throw err;
    
            res.redirect('/kelas/detail/'+req.params.id);
        });
    }
});

router.get('/:id/:nrp/delete', authenticationMiddleware(), function(req, res, next) {
    const db = require('../db');
    const class_id=req.params.id;
    const student_id=req.params.nrp;

    db.query('DELETE FROM kelas_mahasiswa WHERE student_id = ? AND class_id = ?', [student_id, class_id], function(err, result){
        if(err) throw err;

        res.redirect('/kelas/detail/'+class_id);
    })
});

router.get('/detail/:id', authenticationMiddleware(), function(req, res, next) {
    const class_id=req.params.id;
    const db = require('../db');
    db.query('SELECT * FROM kelas_mahasiswa WHERE class_id = ?', [class_id], function(err, results) {
        if(err) throw err;

        if(results.length === 0){
            res.render('kelas/detail_kelas', {
                title: 'Daftar Mahasiswa Kelas',
                class_id: class_id,
            });
        }else{
            res.render('kelas/detail_kelas', {
                title: 'Daftar Mahasiswa Kelas',
                class_id: class_id,
                results: results
            });
        }
    });
})

router.get('/delete/:id', authenticationMiddleware(), function(req, res, next) {
    const db = require('../db');
    const class_id = req.params.id;

    db.query('DELETE FROM kelas_mahasiswa WHERE class_id = ?', [class_id], function(err, row) {
        if(err) throw err;
        db.query('DELETE FROM kelas WHERE id = ?',[class_id],function(err, results) {
            if(err) throw err;
    
            res.redirect('/kelas');
        })
    })
});

router.get('/edit/:id', authenticationMiddleware(), function(req, res, next) {
    const db = require('../db');

    const class_id = req.params.id;

    db.query('SELECT * FROM kelas WHERE id = ?',[class_id],function(err, results, fields) {
        if(err) throw err;
        
        res.render('kelas/edit_kelas', { title: 'Edit Data', results: results});
    })
});

router.post('/edit/:id', authenticationMiddleware(), function(req, res, next) {
    req.checkBody('nama', 'Nama Kelas field cannot be empty.').notEmpty();
    req.checkBody('nama', 'Nama Kelas must be between 4-15 characters long.').len(4, 15);

    const errors = req.validationErrors();

    if(errors){
        res.render('kelas/edit_kelas', {
            title: 'Edit Kelas',
            errors: errors
        });
    } else {
        const nama = req.body.nama;
    
        const db = require('../db');
        db.query('UPDATE kelas SET nama_kelas = ? WHERE id = ?', [nama, req.params.id], function(err) {
            if(err) throw err;
    
            res.redirect('/kelas');
        });
    }
});

router.get('/tambah', authenticationMiddleware(), function(req, res, next) {
    res.render('kelas/tambah_kelas');``
});

router.post('/tambah', authenticationMiddleware(), function(req, res, next) {
    req.checkBody('nama', 'Nama Kelas field cannot be empty.').notEmpty();
    req.checkBody('nama', 'Nama Kelas must be between 4-15 characters long.').len(4, 15);

    const errors = req.validationErrors();

    if(errors){
        res.render('kelas/tambah_kelas', {
        title: 'Tambah Kelas',
        errors: errors
        });
    } else{
        const nama = req.body.nama;

        const db = require('../db');
        db.query('INSERT INTO kelas (nama_kelas) VALUES(?)', [nama], function(err) {
        if(err) throw err;

        res.render('kelas/tambah_kelas', {
            title: 'Tambah Kelas',
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