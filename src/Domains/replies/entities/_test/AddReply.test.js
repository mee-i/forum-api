const AddReply = require('../AddReply');

describe('a AddReplly entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            content: 'This is a reply',
        };

        expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            thread_id: 'thread-123',
            comment_id: {},
            content: 12345,
            owner: {}
        };

        expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create AddReply object correctly', () => {
        const payload = {
            thread_id: 'thread-123',
            comment_id: 'comment-123',
            content: 'This is a reply',
            owner: 'user-123'
        };

        const addReply = new AddReply(payload);

        expect(addReply.thread_id).toEqual(payload.thread_id);
        expect(addReply.comment_id).toEqual(payload.comment_id);
        expect(addReply.content).toEqual(payload.content);
        expect(addReply.owner).toEqual(payload.owner);
    });
});