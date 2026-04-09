const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const os = require('os');

const SQLITE_INDEX = path.resolve(__dirname, '../../build/app-extracted/native/nativelibs/sqlite3');

describe('sqlite3 Native Module', function () {
  this.timeout(15000);

  let sqlite3;

  before(function () {
    try {
      sqlite3 = require(SQLITE_INDEX);
    } catch (e) {
      console.log('sqlite3 native module not loadable:', e.message);
      this.skip();
    }
  });

  it('should export Database constructor', function () {
    expect(sqlite3).to.be.an('object');
    expect(sqlite3.Database).to.be.a('function');
  });

  it('should export Statement constructor', function () {
    expect(sqlite3.Statement).to.be.a('function');
  });

  it('should export Backup constructor', function () {
    expect(sqlite3.Backup).to.be.a('function');
  });

  it('should export cached helper', function () {
    expect(sqlite3.cached).to.be.an('object');
    expect(sqlite3.cached.Database).to.be.a('function');
  });

  it('should create and query a table', function (done) {
    const testDb = path.join(os.tmpdir(), `zalo-sqlite-test-${Date.now()}.db`);
    const db = new sqlite3.Database(testDb, function (err) {
      if (err) return done(err);

      db.run('CREATE TABLE t1 (id INTEGER PRIMARY KEY, name TEXT)', function (err) {
        if (err) return done(err);

        db.run('INSERT INTO t1 (name) VALUES (?)', ['zalo-linux'], function (err) {
          if (err) return done(err);

          db.get('SELECT * FROM t1 WHERE name = ?', ['zalo-linux'], function (err, row) {
            if (err) return done(err);
            try {
              expect(row.name).to.equal('zalo-linux');
              db.close(function (err) {
                if (err) return done(err);
                fs.unlinkSync(testDb);
                done();
              });
            } catch (e) {
              db.close();
              fs.unlinkSync(testDb);
              done(e);
            }
          });
        });
      });
    });
  });

  it('should handle concurrent reads', function (done) {
    const testDb = path.join(os.tmpdir(), `zalo-sqlite-concurrent-${Date.now()}.db`);
    const db = new sqlite3.Database(testDb, function (err) {
      if (err) return done(err);

      db.serialize(function () {
        db.run('CREATE TABLE t2 (id INTEGER PRIMARY KEY, val INTEGER)');
        var stmt = db.prepare('INSERT INTO t2 (val) VALUES (?)');
        for (var i = 0; i < 100; i++) {
          stmt.run(i);
        }
        stmt.finalize(function (err) {
          if (err) return done(err);

          db.all('SELECT * FROM t2 ORDER BY id', function (err, rows) {
            if (err) return done(err);
            try {
              expect(rows).to.have.length(100);
              expect(rows[0].val).to.equal(0);
              expect(rows[99].val).to.equal(99);
              db.close(function (err) {
                if (err) return done(err);
                fs.unlinkSync(testDb);
                done();
              });
            } catch (e) {
              db.close();
              fs.unlinkSync(testDb);
              done(e);
            }
          });
        });
      });
    });
  });

  it('should support WAL mode', function (done) {
    const testDb = path.join(os.tmpdir(), `zalo-sqlite-wal-${Date.now()}.db`);
    const db = new sqlite3.Database(testDb, function (err) {
      if (err) return done(err);

      db.run('PRAGMA journal_mode=WAL', function (err) {
        if (err) return done(err);

        db.get('PRAGMA journal_mode', function (err, row) {
          if (err) return done(err);
          try {
            expect(row.journal_mode).to.equal('wal');
            db.close(function (err) {
              if (err) return done(err);
              fs.unlinkSync(testDb);
              var walFile = testDb + '-wal';
              var shmFile = testDb + '-shm';
              if (fs.existsSync(walFile)) fs.unlinkSync(walFile);
              if (fs.existsSync(shmFile)) fs.unlinkSync(shmFile);
              done();
            });
          } catch (e) {
            db.close();
            fs.unlinkSync(testDb);
            done(e);
          }
        });
      });
    });
  });
});
