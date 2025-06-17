const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationTestHelper = require('../../../../tests/AuthenticationTestHelper');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken } = await AuthenticationTestHelper.getAccessToken(server);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
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
    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

      await ThreadsTableTestHelper.addThread({
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
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

    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const server = await createServer(container);

      const { userId } = await AuthenticationTestHelper.getAccessToken(server);

      await ThreadsTableTestHelper.addThread({
        owner: userId,
      });

      await CommentsTableTestHelper.addComment({
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 when give correct request', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

      await ThreadsTableTestHelper.addThread({
        owner: userId,
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

});
