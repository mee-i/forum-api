const DeleteComment = require('../DeleteComment');

describe('a DeleteComment entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            commentId: 'abcdefghijkl',
        };

        expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            commentId: 12345,
            threadId: 12345,
        };

        expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create deleteComment object correctly', () => {
        const payload = {
            commentId: 'This is a comment',
            threadId: 'thread-123',
        };

        const addComment = new DeleteComment(payload);

        expect(addComment.commentId).toEqual(payload.commentId);
        expect(addComment.threadId).toEqual(payload.threadId);
    });
});