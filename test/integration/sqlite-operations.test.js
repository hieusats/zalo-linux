const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const os = require('os');

const SQLITE_INDEX = path.resolve(__dirname, '../../build/app-extracted/native/nativelibs/sqlite3');

describe('SQLite Integration Operations', function () {
  this.timeout(20000);

  let sqlite3;

  before(function () {
    try {
      sqlite3 = require(SQLITE_INDEX);
    } catch (e) {
      console.log('sqlite3 native module not loadable:', e.message);
      this.skip();
    }
  });

  function tempDb(name) {
    return path.join(os.tmpdir(), `zalo-integ-${name}-${Date.now()}.db`);
  }

  function cleanup(dbPath) {
    try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath); } catch {}
    try { if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal'); } catch {}
    try { if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm'); } catch {}
  }

  describe('CRUD operations', function () {
    it('should create table, insert, read, update, delete', function (done) {
      const dbPath = tempDb('crud');
      const db = new sqlite3.Database(dbPath, function (err) {
        if (err) return done(err);

        db.serialize(function () {
          db.run('CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, value REAL)', function (err) {
            if (err) return done(err);

            db.run('INSERT INTO items (name, value) VALUES (?, ?)', ['alpha', 1.5], function (err) {
              if (err) return done(err);
              const id = this.lastID;

              db.get('SELECT * FROM items WHERE id = ?', [id], function (err, row) {
                if (err) return done(err);
                try {
                  expect(row.name).to.equal('alpha');
                  expect(row.value).to.equal(1.5);

                  db.run('UPDATE items SET value = ? WHERE id = ?', [99.9, id], function (err) {
                    if (err) return done(err);

                    db.get('SELECT value FROM items WHERE id = ?', [id], function (err, row) {
                      if (err) return done(err);
                      try {
                        expect(row.value).to.equal(99.9);

                        db.run('DELETE FROM items WHERE id = ?', [id], function (err) {
                          if (err) return done(err);

                          db.all('SELECT * FROM items', function (err, rows) {
                            if (err) return done(err);
                            try {
                              expect(rows).to.have.length(0);
                              db.close(function (err) {
                                if (err) return done(err);
                                cleanup(dbPath);
                                done();
                              });
                            } catch (e) {
                              db.close();
                              cleanup(dbPath);
                              done(e);
                            }
                          });
                        });
                      } catch (e) {
                        db.close(); cleanup(dbPath); done(e);
                      }
                    });
                  });
                } catch (e) {
                  db.close(); cleanup(dbPath); done(e);
                }
              });
            });
          });
        });
      });
    });
  });

  describe('WAL mode', function () {
    it('should enable WAL and verify journal_mode', function (done) {
      const dbPath = tempDb('wal');
      const db = new sqlite3.Database(dbPath, function (err) {
        if (err) return done(err);

        db.run('PRAGMA journal_mode=WAL', function (err) {
          if (err) return done(err);

          db.get('PRAGMA journal_mode', function (err, row) {
            if (err) return done(err);
            try {
              expect(row.journal_mode).to.equal('wal');
              db.close(function (err) {
                if (err) return done(err);
                cleanup(dbPath);
                done();
              });
            } catch (e) {
              db.close(); cleanup(dbPath); done(e);
            }
          });
        });
      });
    });
  });

  describe('Concurrent access', function () {
    it('should handle 500 inserts in serialized mode', function (done) {
      const dbPath = tempDb('concurrent');
      const db = new sqlite3.Database(dbPath, function (err) {
        if (err) return done(err);

        db.serialize(function () {
          db.run('CREATE TABLE stress (id INTEGER PRIMARY KEY, v INTEGER)');
          const stmt = db.prepare('INSERT INTO stress (v) VALUES (?)');
          for (let i = 0; i < 500; i++) {
            stmt.run(i);
          }
          stmt.finalize(function (err) {
            if (err) return done(err);

            db.all('SELECT COUNT(*) as cnt FROM stress', function (err, rows) {
              if (err) return done(err);
              try {
                expect(rows[0].cnt).to.equal(500);
                db.close(function (err) {
                  if (err) return done(err);
                  cleanup(dbPath);
                  done();
                });
              } catch (e) {
                db.close(); cleanup(dbPath); done(e);
              }
            });
          });
        });
      });
    });
  });

  describe('Blob storage', function () {
    it('should store and retrieve binary data', function (done) {
      const dbPath = tempDb('blob');
      const db = new sqlite3.Database(dbPath, function (err) {
        if (err) return done(err);

        db.serialize(function () {
          db.run('CREATE TABLE blobs (id INTEGER PRIMARY KEY, data BLOB)');
          const testBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

          db.run('INSERT INTO blobs (data) VALUES (?)', [testBuffer], function (err) {
            if (err) return done(err);

            db.get('SELECT data FROM blobs WHERE id = 1', function (err, row) {
              if (err) return done(err);
              try {
                expect(Buffer.isBuffer(row.data)).to.be.true;
                expect(Buffer.compare(row.data, testBuffer)).to.equal(0);
                db.close(function (err) {
                  if (err) return done(err);
                  cleanup(dbPath);
                  done();
                });
              } catch (e) {
                db.close(); cleanup(dbPath); done(e);
              }
            });
          });
        });
      });
    });
  });

  describe('Transactions', function () {
    it('should rollback on error within a transaction', function (done) {
      const dbPath = tempDb('txn');
      const db = new sqlite3.Database(dbPath, function (err) {
        if (err) return done(err);

        db.serialize(function () {
          db.run('CREATE TABLE txn_test (id INTEGER PRIMARY KEY, val TEXT)');
          db.run('INSERT INTO txn_test (val) VALUES (?)', ['original'], function (err) {
            if (err) return done(err);

            db.run('BEGIN TRANSACTION', function (err) {
              if (err) return done(err);
              db.run('UPDATE txn_test SET val = ? WHERE id = 1', ['modified'], function (err) {
                if (err) return done(err);
                db.run('ROLLBACK', function (err) {
                  if (err) return done(err);

                  db.get('SELECT val FROM txn_test WHERE id = 1', function (err, row) {
                    if (err) return done(err);
                    try {
                      expect(row.val).to.equal('original');
                      db.close(function (err) {
                        if (err) return done(err);
                        cleanup(dbPath);
                        done();
                      });
                    } catch (e) {
                      db.close(); cleanup(dbPath); done(e);
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
