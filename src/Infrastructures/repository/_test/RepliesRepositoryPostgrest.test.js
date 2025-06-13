const pool = require('../../database/postgres/pool.js');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper.js');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper.js');
const RepliesRepositoryPostgres = require('../RepliesRepositoryPostgres.js');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres.js');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres.js');
const AddedReply = require('../../../Domains/replies/entities/AddedReply.js');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError.js');

describe('RepliesRepository postgres', () => {
    afterEach(async () => {
        await RepliesTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addReply function', () => {
        it('should persist new reply and return added reply correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({
                username: 'dicoding',
                password: 'supersecretpassword',
                fullname: 'Dicoding Indonesia',
            });
            const addThread = new AddThread({
                title: 'This is thread',
                body: 'This is body',
                owner: 'user-123'
            });


            const fakeIdGenerator = () => '123';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            const addedThread = await threadRepositoryPostgres.addThread(addThread);
            const addComment = new AddComment({
                thread_id: addedThread.id,
                content: "This is comment",
                owner: addedThread.owner
            })

            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

            const addedComment = await commentRepositoryPostgres.addComment(addComment);

            const addReply = new AddReply({
                thread_id: 'thread-123',
                comment_id: 'comment-123',
                content: 'a reply',
                owner: 'user-123',
            });

            const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const addedReply = await repliesRepositoryPostgres.addReply(addReply);

            // Assert
            const replies = await RepliesTableTestHelper.verifyReply('reply-123', addedComment.id);
            expect(replies).toHaveLength(1);
            expect(addedReply).toStrictEqual(new AddedReply({
                id: 'reply-123',
                content: 'a reply',
                owner: 'user-123',
            }));
        });
    });

    describe('deleteReplyById function', () => {
        it('should soft delete reply by id', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-123'
            });
            await RepliesTableTestHelper.addReply({
                id: 'reply-123',
                comment_id: 'comment-123',
                content: 'reply content',
                owner: 'user-123',
            });

            const fakeIdGenerator = () => '123';
            const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            await repliesRepositoryPostgres.deleteReplyById('reply-123');

            // Assert
            const reply = await RepliesTableTestHelper.verifyReply('reply-123', 'comment-123');
            expect(reply[0].is_delete).toBe(true);
        });
    });

    describe('verifyReplyOwner function', () => {
        it('should throw error if reply not owned by user', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'User123' });
            await UsersTableTestHelper.addUser({ id: 'user-456', username: 'User456' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-123'
            });
            await RepliesTableTestHelper.addReply({
                id: 'reply-123',
                comment_id: 'comment-123',
                content: 'reply content',
                owner: 'user-123',
            });

            const fakeIdGenerator = () => '123';
            const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, fakeIdGenerator);

            // Action & Assert
            await expect(repliesRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'))
                .rejects
                .toThrowError(AuthorizationError);
        });

        it('should not throw error if reply owned by user', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-123'
            });
            await RepliesTableTestHelper.addReply({
                id: 'reply-123',
                comment_id: 'comment-123',
                content: 'reply content',
                owner: 'user-123',
            });
            const fakeIdGenerator = () => '123';
            const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, fakeIdGenerator);

            // Action & Assert
            await expect(repliesRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
                .resolves.not.toThrow();
        });
    });

    describe('getRepliesByCommentId function', () => {
        it('should return replies', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            await ThreadsTableTestHelper.addThread({
                id: 'thread-123',
                title: 'This is thread',
                body: 'This is body',
                date: "2025-06-09T11:06:24.541Z",
                owner: 'user-123'
            });
            await CommentsTableTestHelper.addComment({
                id: 'comment-123'
            });

            await RepliesTableTestHelper.addReply({
                id: 'reply-123',
                comment_id: 'comment-123',
                content: 'reply content',
                owner: 'user-123',
            });

            const expectedReplies = [
                {
                    id: 'reply-123',
                    content: 'reply content',
                    username: 'dicoding',
                    date: '2025-06-09T11:06:24.541Z',
                }
            ]

            const fakeIdGenerator = () => '123';
            const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const replies = await repliesRepositoryPostgres.getRepliesByCommentId('comment-123');

            // Assert
            expect(replies).toHaveLength(1);
            expect(replies).toEqual(expectedReplies);
        });
    });
});
