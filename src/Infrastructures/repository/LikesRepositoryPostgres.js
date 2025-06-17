const LikesRepository = require('../../Domains/likes/LikesRepository');

class LikesRepositoryPostgres extends LikesRepository {
    constructor(pool) {
        super();
        this._pool = pool;
    }

    async addLike(payload) {
        const { thread_id, comment_id, owner } = payload;

        const query = {
            text: 'INSERT INTO likes (comment_id, user_id) VALUES($1, $2) RETURNING comment_id, user_id',
            values: [comment_id, owner],
        };
        const result = await this._pool.query(query);
        return result.rowCount;
    }

    async isExists(comment_id, owner) {
        const query = {
            text: `
                SELECT 1 FROM likes WHERE comment_id = $1 AND user_id = $2`,
            values: [comment_id, owner],
        };
        const result = await this._pool.query(query);
        return result.rowCount;
    }

    async deleteLikeByCommentIdAndOwner(comment_id, owner) {
        const query = {
            text: 'DELETE FROM likes WHERE comment_id = $1 AND user_id = $2',
            values: [comment_id, owner],
        };
        await this._pool.query(query);
    }

    async getLikesCountByCommentId(comment_id) {
        const query = {
            text: 'SELECT 1 FROM likes WHERE comment_id = $1',
            values: [comment_id]
        }

        const result = await this._pool.query(query);
        return result.rowCount;
    }
}

module.exports = LikesRepositoryPostgres;
