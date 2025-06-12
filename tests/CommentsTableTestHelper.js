/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({ id = 'comment-123', content = 'comment', thread_id = 'thread-123', owner = 'user-123', date = "2025-06-09T11:06:24.541Z", is_delete = false }) {
    const query = {
      text: 'INSERT INTO comments (id, content, thread_id, user_id, date, is_delete) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, user_id as owner',
      values: [id, content, thread_id, owner, date, is_delete],
    };

    await pool.query(query);
  },


  async getCommentsByThreadId(id) {
    const query = {
      text: `
        SELECT comments.id, comments.content, comments.date, comments.is_delete, users.username
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.thread_id = $1
        ORDER BY comments.date ASC
      `,
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows;
  },

  async verifyComment(id, thread_id) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND thread_id = $2',
      values: [id, thread_id]
    }
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
    return result.rows;
  },

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
  },

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id, content, thread_id, user_id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
    return result.rows;
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },
  
  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
