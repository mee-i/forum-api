const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const RepliesRepository = require('../../Domains/replies/RepliesRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class ReplyRepositoryPostgres extends RepliesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(payload) {
    const { comment_id, content, owner } = payload;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies (id, content, comment_id, user_id) VALUES($1, $2, $3, $4) RETURNING id, content, user_id as owner',
      values: [id, content, comment_id, owner],
    };
    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async getRepliesByCommentId(id) {
    const query = {
      text: `
      SELECT 
        replies.id,
        replies.content,
        replies.date,
        replies.is_delete,
        users.username
      FROM replies
      JOIN users ON replies.user_id = users.id
      WHERE replies.comment_id = $1
      ORDER BY replies.date ASC
      `,
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyReply(id, comment_id) {
    const query = {
      text: 'SELECT 1 FROM replies WHERE id = $1 AND comment_id = $2',
      values: [id, comment_id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }
    return result.rows;
  }

  async verifyReplyOwner(id, owner) {
    const query = {
      text: 'SELECT 1 FROM replies WHERE id = $1 AND user_id = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError(
        'Anda tidak berhak mengakses resource ini',
      );
    }

    return result.rows;
  }

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id, content, comment_id, user_id as owner',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
