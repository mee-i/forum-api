const pool = require('../../database/postgres/pool.js');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres.js');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper.js');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper.js');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper.js');
const AddThread = require('../../../Domains/threads/entities/AddThread.js');
const NotfoundError = require('../../../Commons/exceptions/NotFoundError.js');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres.js');
const AddComment = require('../../../Domains/comments/entities/AddComment.js');
const AddedComment = require('../../../Domains/comments/entities/AddedComment.js');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError.js');

describe('CommentRepository postgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
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

      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'This is comment',
        owner: 'user-123',
      }));

      const comments = await CommentsTableTestHelper.verifyComment('comment-123', addedThread.id);
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'johndoe',
        password: 'supersecretpassword',
        fullname: 'John Doe',
      });
      const addThread = new AddThread({
        title: 'Another thread',
        body: 'Another body',
        owner: 'user-456',
      });
      const fakeIdGenerator = () => '456';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      const addComment = new AddComment({
        thread_id: addedThread.id,
        content: 'Another comment',
        owner: addedThread.owner,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-456',
        content: 'Another comment',
        owner: 'user-456',
      }));

      const comments = await CommentsTableTestHelper.verifyComment('comment-456', addedThread.id);
      expect(comments).toHaveLength(1);
    });
  });
  describe('getCommentsByThreadId function', () => {
    it('should return comments correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'supersecretpassword',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'This is thread',
        body: 'This is body',
        date: '2025-06-09T11:06:24.541Z',
        owner: 'user-123',
      });

      const expectedComments = [
        {
          id: 'comment-123',
          username: 'dicoding',
          content: 'This is comment',
          date: '2025-06-09T11:06:24.541Z',
        },
        {
          id: 'comment-124',
          username: 'dicoding',
          content: '**komentar telah dihapus**',
          date: '2025-06-09T12:06:24.541Z',
        },
      ];
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'This is comment',
        date: '2025-06-09T11:06:24.541Z',
        is_delete: false,
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-124',
        content: 'This is comment',
        date: '2025-06-09T12:06:24.541Z',
        is_delete: true,
        owner: 'user-123',
      });

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toEqual(expectedComments);
    });
  });

  describe('verifyComment function', () => {
    it('should return error correctly if comment not found', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'This is thread',
        body: 'This is body',
        date: '2025-06-09T11:06:24.541Z',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await expect(commentRepositoryPostgres.verifyComment('comment-123', 'thread-123')).rejects.toThrow(NotfoundError);
    });

    it('should return correctly if comment found', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'This is thread',
        body: 'This is body',
        date: '2025-06-09T11:06:24.541Z',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(new AddComment({
        thread_id: 'thread-123',
        content: 'This is comment',
        owner: 'user-123',
      }));

      const verifiedComment = await commentRepositoryPostgres.verifyComment('comment-123', 'thread-123');
      expect(verifiedComment).toHaveLength(1);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should return error correctly when no have access', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-124',
        username: 'JohnDoe',
        fullname: 'John Doe',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-132',
        title: 'This is thread',
        body: 'This is thread body',
        date: '2025-06-09T11:06:24.541Z',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-132',
        content: 'Unauthorized comment',
        date: '2025-06-09T11:06:24.541Z',
        is_delete: false,
        owner: 'user-123',
        thread_id: 'thread-132',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '132');

      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-132', 'user-124'),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should return correctly when have access', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-132',
        title: 'This is thread',
        body: 'This is thread body',
        date: '2025-06-09T11:06:24.541Z',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-132',
        content: 'Authorized comment',
        date: '2025-06-09T11:06:24.541Z',
        is_delete: false,
        owner: 'user-123',
        thread_id: 'thread-132',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '132');

      const verfiedOwner = await commentRepositoryPostgres.verifyCommentOwner('comment-132', 'user-123');
      expect(verfiedOwner).toHaveLength(1);
    });
  });

  describe('deleteCommentById function', () => {
    it('should soft delete comment by id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-999' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-999',
        title: 'Thread to delete comment',
        body: 'Body',
        date: '2025-06-09T11:06:24.541Z',
        owner: 'user-999',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-999',
        content: 'Comment to be deleted',
        date: '2025-06-09T11:06:24.541Z',
        is_delete: false,
        owner: 'user-999',
        thread_id: 'thread-999',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '999');

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-999');

      // Assert
      const [comment] = await CommentsTableTestHelper.verifyComment('comment-999', 'thread-999');
      expect(comment.is_delete).toBe(true);
    });
  });
});
