/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    comment_id = 'comment-123', owner = 'user-123', date = '2025-06-09T11:06:24.541Z',
  }) {
    const query = {
      text: 'INSERT INTO likes (comment_id, user_id, date) VALUES($1, $2, $3) RETURNING comment_id, user_id',
      values: [comment_id, owner, date],
    };
    const result = await pool.query(query);
    return result.rowCount;
  },

  async isExists(comment_id, owner) {
    const query = {
      text: `
      SELECT 1 FROM likes WHERE comment_id = $1 AND user_id = $2`,
      values: [comment_id, owner],
    };
    const result = await pool.query(query);
    return result.rowCount;
  },

  async deleteLikeByCommentIdAndOwner(comment_id, owner) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [comment_id, owner],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
