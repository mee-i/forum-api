const DeleteReply = require('../DeleteReply');

describe('a DeleteReply entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            threadId: 'thread-123',
            commentId: 'comment-123',
        };

        expect(() => new DeleteReply(payload)).toThrowError('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            threadId: {},
            commentId: 'comment-123',
            replyId: 'reply-123',
        };

        expect(() => new DeleteReply(payload)).toThrowError('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create deleteReply object correctly', () => {
        const payload = {
            threadId: 'thread-123',
            commentId: 'comment-123',
            replyId: 'reply-123',
        };

        const addThread = new DeleteReply(payload);

        expect(addThread.threadId).toEqual(payload.threadId);
    });
});