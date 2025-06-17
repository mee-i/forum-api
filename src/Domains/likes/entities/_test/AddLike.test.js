const AddLike = require('../AddLike');

describe('a AddLike entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            comment_id: 'comment-123',
        };

        expect(() => new AddLike(payload)).toThrowError('ADD_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            comment_id: {},
            owner: 'user-123'
        };

        expect(() => new AddLike(payload)).toThrowError('ADD_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create AddLike object correctly', () => {
        const payload = {
            comment_id: 'comment-123',
            owner: 'user-123',
        };

        const addLike = new AddLike(payload);

        expect(addLike.comment_id).toEqual(payload.comment_id);
        expect(addLike.owner).toEqual(payload.owner);
    });
});
