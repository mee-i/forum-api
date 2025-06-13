/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addReply({
    id = 'reply-123', comment_id = 'comment-123', content = 'This is reply', owner = 'user-123', is_delete = false, date = '2025-06-09T11:06:24.541Z',
  }) {
    const query = {
      text: 'INSERT INTO replies (id, content, comment_id, user_id, is_delete, date) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, user_id as owner',
      values: [id, content, comment_id, owner, is_delete, date],
    };
    await pool.query(query);
  },

  async getRepliesByCommentId(id) {
    const query = {
      text: `
      SELECT 
        replies.id,
        CASE
        WHEN replies.is_delete = true THEN '**balasan telah dihapus**'
        ELSE replies.content
        END AS content,
        replies.date,
        users.username
      FROM replies
      JOIN users ON replies.user_id = users.id
      WHERE replies.comment_id = $1
      ORDER BY replies.date ASC
      `,
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async verifyReply(id, comment_id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND comment_id = $2',
      values: [id, comment_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async verifyReplyOwner(id, owner) {
    const query = {
      text: 'SELECT 1 FROM replies WHERE id = $1 AND user_id = $2',
      values: [id, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id, content, comment_id, user_id as owner',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
