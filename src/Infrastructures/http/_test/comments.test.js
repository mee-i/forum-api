const pool = require('../../database/postgres/pool');
const CommentsTableHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationTestHelper = require('../../../../tests/AuthenticationTestHelper');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableHelper.cleanTable();
    await CommentsTableHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken } = await AuthenticationTestHelper.getAccessToken(server);

      const requestPayload = {
        content: 'This is content',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is content',
      };
      const server = await createServer(container);

      const { userId } = await AuthenticationTestHelper.getAccessToken(server);
      // default id: thread-123
      await ThreadsTableHelper.addThread({ owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request contain invalid data type', async () => {
      // Arrange
      const requestPayload = {
        content: true,
      };
      const server = await createServer(container);

      const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

      await ThreadsTableHelper.addThread({ owner: userId });
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 201 when given correct payload', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is content',
      };
      const server = await createServer(container);

      const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

      await ThreadsTableHelper.addThread({ owner: userId });
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: requestPayload.content,
          owner: userId,
        }),
      );
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

      await ThreadsTableHelper.addThread({ owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 403 when user is not the owner of the comment', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken } = await AuthenticationTestHelper.getAccessToken(server);
      const { userId: anotherUser } = await AuthenticationTestHelper.getAccessToken(server, { username: 'JaneDoe', password: 'supersecretpassword', fullname: 'Jane Doe' });

      await ThreadsTableHelper.addThread({ id: 'thread-123', owner: anotherUser });
      await CommentsTableHelper.addComment({ owner: anotherUser });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });

    it('should response 200 when delete comment success', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

      await ThreadsTableHelper.addThread({ owner: userId });
      await CommentsTableHelper.addComment({ owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const thisiskosong = null;
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(thisiskosong).toBe(1);
    });
  });
});
