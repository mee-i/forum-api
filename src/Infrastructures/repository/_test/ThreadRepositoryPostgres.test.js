const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres.js');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper.js');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper.js');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const NotfoundError = require('../../../Commons/exceptions/NotFoundError.js');

describe('ThreadRepository postgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThreads function', () => {
    it('should persist new thread and return added thread correctly', async () => {
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

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'This is thread',
        owner: 'user-123',
      }));
      const threads = await ThreadsTableTestHelper.verifyThread('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
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

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-456',
        title: 'Another thread',
        owner: 'user-456',
      }));
    });
  });
  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrowError(NotfoundError);
    });
    it('should return thread details correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'supersecretpassword',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'This is thread',
        body: 'This is body',
        date: '2025-06-09T11:06:24.541Z',
        owner: 'user-123',
      });

      const expectedThread = new DetailThread({
        id: 'thread-123',
        title: 'This is thread',
        body: 'This is body',
        date: '2025-06-09T11:06:24.541Z',
        username: 'dicoding',
      });

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toEqual(expectedThread);
    });
  });
});
