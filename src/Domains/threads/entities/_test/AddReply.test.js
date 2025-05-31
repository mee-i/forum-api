const AddReply = require('../AddReply');

describe('a AddReply entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            threadId: 'thread-123',
            commentId: 'comment-123',
        };

        expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            threadId: {},
            commentId: 'comment-123',
            content: 'This is a reply content.',
        };

        expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create addReply object correctly', () => {
        const payload = {
            threadId: 'thread-123',
            commentId: 'comment-123',
            content: 'This is a reply content.',
        };

        const addThread = new AddReply(payload);

        expect(addThread.threadId).toEqual(payload.threadId);
    });
});