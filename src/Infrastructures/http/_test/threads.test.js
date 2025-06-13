const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationTestHelper = require('../../../../tests/AuthenticationTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });



  describe('when POST /threads', () => {
    it('should response 401 when request missing authentication', async () => {
      // Arrange
      const requestPayload = {
        title: 'This is title',
        body: 'This is body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'This is title',
      };
      const server = await createServer(container);

      const { accessToken } = await AuthenticationTestHelper.getAccessToken(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload data type not valid', async () => {
      // Arrange
      const requestPayload = {
        title: 123,
        body: true,
      };
      const server = await createServer(container);

      const { accessToken } = await AuthenticationTestHelper.getAccessToken(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      // console.log(responseJson);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted thread when request payload is valid', async () => {
      // Arrange
      const requestPayload = {
        title: 'This is title',
        body: 'This is title',
      };
      const server = await createServer(container);

      const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: requestPayload.title,
          owner: userId,
        })
      );
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it("should response 200 and returning correct data", async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);
      await ThreadsTableTestHelper.addThread({ owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-124', owner: userId, is_delete: true, date: '2025-06-09T12:06:24.541Z' });

      // add reply to comment-123
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: userId});
      await RepliesTableTestHelper.addReply({ id: 'reply-124', owner: userId, is_delete: true, date: '2025-06-09T12:06:24.541Z' });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toEqual(
        expect.objectContaining({
          id: 'thread-123',
          title: 'This is thread',
          body: 'This is body',
          date: '2025-06-09T11:06:24.541Z',
          username: 'JohnDoe123',
          comments: [
            {
              id: 'comment-123',
              username: 'JohnDoe123',
              date: '2025-06-09T11:06:24.541Z',
              content: 'comment',
              replies: [
                {
                  id: 'reply-123',
                  content: 'This is reply',
                  date: '2025-06-09T11:06:24.541Z',
                  username: 'JohnDoe123'
                },
                {
                  id: 'reply-124',
                  content: '**balasan telah dihapus**',
                  date: '2025-06-09T12:06:24.541Z',
                  username: 'JohnDoe123'
                },
              ]
            },
            {
              id: 'comment-124',
              username: 'JohnDoe123',
              date: '2025-06-09T12:06:24.541Z',
              content: '**komentar telah dihapus**',
              replies: []
            }
          ]
        })
      )

    })
  })
});
