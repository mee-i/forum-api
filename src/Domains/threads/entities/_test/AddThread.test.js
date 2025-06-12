const AddThread = require('../AddThread');

describe('a AddThread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            title: 'Thread Title',
        };

        expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            title: 'Thread Title',
            body: {},
            owner: 12345,
        };

        expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create AddThread object correctly', () => {
        const payload = {
            title: 'Thread Title',
            body: 'This is the body of the thread.',
            owner: 'user-123',
        };

        const addThread = new AddThread(payload);

        expect(addThread.title).toEqual(payload.title);
        expect(addThread.body).toEqual(payload.body);
        expect(addThread.owner).toEqual(payload.owner);
    });
});