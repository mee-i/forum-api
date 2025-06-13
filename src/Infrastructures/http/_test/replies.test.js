
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationTestHelper = require('../../../../tests/AuthenticationTestHelper');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const { user } = require('pg/lib/defaults.js');

describe('/replies endpoint', () => {

    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await RepliesTableTestHelper.cleanTable();
    });

    describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
        it('should response 404 when thread not found', async () => {
            // Arrange
            const server = await createServer(container);

            const { accessToken } = await AuthenticationTestHelper.getAccessToken(server);

            const requestPayload = {
                content: "This is reply"
            }

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments/comment-123/replies',
                payload: requestPayload,
                headers: {
                    authorization: `Bearer ${accessToken}`
                }
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
                owner: userId
            });

            const requestPayload = {
                content: "This is reply"
            }

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments/comment-123/replies',
                payload: requestPayload,
                headers: {
                    authorization: `Bearer ${accessToken}`
                }
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
                owner: userId
            });

            await CommentsTableTestHelper.addComment({
                owner: userId
            });

            const requestPayload = {
                content: "This is reply"
            }

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments/comment-123/replies',
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
            const server = await createServer(container);

            const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

            await ThreadsTableTestHelper.addThread({
                owner: userId
            });

            await CommentsTableTestHelper.addComment({
                owner: userId
            });

            const requestPayload = {
                content: {}
            }

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments/comment-123/replies',
                payload: requestPayload,
                headers: {
                    authorization: `Bearer ${accessToken}`
                }
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
        });

        it('should response 201 when give correct payload', async () => {
            // Arrange
            const server = await createServer(container);

            const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

            await ThreadsTableTestHelper.addThread({
                owner: userId
            });

            await CommentsTableTestHelper.addComment({
                owner: userId
            });

            const requestPayload = {
                content: "This is reply"
            }

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments/comment-123/replies',
                payload: requestPayload,
                headers: {
                    authorization: `Bearer ${accessToken}`
                }
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
        });
    });

    describe('when DELETE /threads/{threadId}/comments/{commentId/replies/{replyId}', () => {
        it('should response 404 when thread not found', async () => {
            // Arrange
            const server = await createServer(container);

            const { accessToken } = await AuthenticationTestHelper.getAccessToken(server);

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123/replies/reply-123',
                headers: {
                    authorization: `Bearer ${accessToken}`
                }
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

            await ThreadsTableTestHelper.addThread({owner: userId});

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123/replies/reply-123',
                headers: {
                    authorization: `Bearer ${accessToken}`
                }
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('Komentar tidak ditemukan');
        });

        it('should response 404 when reply not found', async () => {
            // Arrange
            const server = await createServer(container);

            const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

            await ThreadsTableTestHelper.addThread({owner: userId});
            await CommentsTableTestHelper.addComment({owner: userId});

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123/replies/reply-123',
                headers: {
                    authorization: `Bearer ${accessToken}`
                }
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('Balasan tidak ditemukan');
        });

        it('should response 401 when request not contain access token', async () => {
            // Arrange
            const server = await createServer(container);

            const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

            await ThreadsTableTestHelper.addThread({owner: userId});
            await CommentsTableTestHelper.addComment({owner: userId});
            await RepliesTableTestHelper.addReply({owner: userId});

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123/replies/reply-123',
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(401);
            expect(responseJson.error).toEqual('Unauthorized');
            expect(responseJson.message).toEqual('Missing authentication');
        });

        it('should response 200 when delete reply success', async () => {
            // Arrange
            const server = await createServer(container);

            const { accessToken, userId } = await AuthenticationTestHelper.getAccessToken(server);

            await ThreadsTableTestHelper.addThread({owner: userId});
            await CommentsTableTestHelper.addComment({owner: userId});
            await RepliesTableTestHelper.addReply({owner: userId});

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123/replies/reply-123',
                headers: {
                    authorization: `Bearer ${accessToken}`
                }
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
        });
    });
});