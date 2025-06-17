const pool = require('../../database/postgres/pool.js');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper.js');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper.js');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres.js');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres.js');
const LikesRepositoryPostgres = require('../LikesRepositoryPostgres.js');
const AddLike = require('../../../Domains/likes/entities/AddLike.js');
const AddThread = require('../../../Domains/threads/entities/AddThread.js');
const AddComment = require('../../../Domains/comments/entities/AddComment.js');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper.js');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper.js');

describe('LikesRepository postgres', () => {
    afterEach(async () => {
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await LikesTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addLike function', () => {
        it('should persist new like and return correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({
                username: 'dicoding',
                password: 'supersecretpassword',
                fullname: 'Dicoding Indonesia',
            });
            const addThread = new AddThread({
                title: 'This is thread',
                body: 'This is body',
                owner: 'user-123',
            });

            const fakeIdGenerator = () => '123';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            const addedThread = await threadRepositoryPostgres.addThread(addThread);
            const addComment = new AddComment({
                thread_id: addedThread.id,
                content: 'This is comment',
                owner: addedThread.owner,
            });

            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

            await commentRepositoryPostgres.addComment(addComment);

            const addLike = new AddLike({
                comment_id: 'comment-123',
                owner: 'user-123',
            });

            const likesRepositoryPostgres = new LikesRepositoryPostgres(pool);

            // Action
            const like = await likesRepositoryPostgres.addLike(addLike);

            // Assert
            expect(like).toBe(1);
        });
    });

    describe('isExists function', () => {
        it('should return false if like doesn\'t exist', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'User123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-123',
            });

            const likesRepositoryPostgres = new LikesRepositoryPostgres(pool);

            // Action & Assert
            const isLiked = await likesRepositoryPostgres.isExists('comment-123', 'user-123');
            expect(isLiked).toBe(0);
        });

        it('should return true if like exist', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'User123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-123',
            });
            await LikesTableTestHelper.addLike({
                comment_id: 'comment-123',
                owner: 'user-123',
            });

            const likesRepositoryPostgres = new LikesRepositoryPostgres(pool);

            // Action & Assert
            const isLiked = await likesRepositoryPostgres.isExists('comment-123', 'user-123');
            expect(isLiked).toBe(1);
        });
    });

    describe('deleteLikeByCommentIdAndOwner function', () => {
        it('should delete like by comment_id and owner', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'User123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-123',
            });
            await LikesTableTestHelper.addLike({
                comment_id: 'comment-123',
                owner: 'user-123',
            });

            const likesRepositoryPostgres = new LikesRepositoryPostgres(pool);

            // Action & Assert
            const isLiked = await likesRepositoryPostgres.isExists('comment-123', 'user-123');
            expect(isLiked).toBe(1);

            await likesRepositoryPostgres.deleteLikeByCommentIdAndOwner('comment-123', 'user-123')

            const newIsLiked = await likesRepositoryPostgres.isExists('comment-123', 'user-123');
            expect(newIsLiked).toBe(0);
        });
    });

    describe('getLikesCountByCommentId function', () => {
        it('should delete like by comment_id and owner', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'User123' });
            await UsersTableTestHelper.addUser({ id: 'user-456', username: 'User456' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-123',
            });
            await LikesTableTestHelper.addLike({
                comment_id: 'comment-123',
                owner: 'user-123',
            });
            await LikesTableTestHelper.addLike({
                comment_id: 'comment-123',
                owner: 'user-456',
            });

            const likesRepositoryPostgres = new LikesRepositoryPostgres(pool);

            // Action & Assert
            const isLiked = await likesRepositoryPostgres.isExists('comment-123', 'user-123');
            expect(isLiked).toBe(1);

            const count = await likesRepositoryPostgres.getLikesCountByCommentId('comment-123');
            expect(count).toBe(2);
        });
    })
});
