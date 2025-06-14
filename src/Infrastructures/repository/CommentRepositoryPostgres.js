const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(payload) {
    const { thread_id, content, owner } = payload;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments (id, content, thread_id, user_id) VALUES($1, $2, $3, $4) RETURNING id, content, user_id as owner',
      values: [id, content, thread_id, owner],
    };
    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentsByThreadId(id) {
    const query = {
      text: `
      SELECT 
        comments.id,
        comments.content,
        comments.is_delete,
        comments.date,
        users.username
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.thread_id = $1
      ORDER BY comments.date ASC
      `,
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyComment(id, thread_id) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND thread_id = $2',
      values: [id, thread_id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
    return result.rows;
  }

  async verifyCommentOwner(commentId, ownerId) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND user_id = $2',
      values: [commentId, ownerId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError(
        'Anda tidak berhak mengakses resource ini',
      );
    }

    return result.rows;
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING 1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus balasan');
    }
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
