const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../Domains/threads/entities/DetailThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(payload) {
    const { title, body, owner } = payload;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads (id, title, body, user_id) VALUES($1, $2, $3, $4) RETURNING id, title, user_id as owner',
      values: [id, title, body, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan thread');
    }
    return new AddedThread({ ...result.rows[0] });
  }

  async verifyThreadById(id) {
    const query = {
      text: 'SELECT 1 FROM threads WHERE id = $1',
      values: [id]
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan')
    }
    return result.rows;
  }

  async getThreadById(id) {
    const query = {
      text: 'SELECT threads.id, title, body, date, users.username FROM threads JOIN users ON threads.user_id = users.id WHERE threads.id = $1',
      values: [id]
    }
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');  
    }
    // console.log(result.rows[0]);
    // TODO: Gabungkan comments disini!!!
    return new DetailThread({ ...result.rows[0] });
  }
}

module.exports = ThreadRepositoryPostgres;
