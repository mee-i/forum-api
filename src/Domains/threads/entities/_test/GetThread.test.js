const GetThread = require('../GetThread');

describe('a AddThread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            
        };

        expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            threadId: {},
        };

        expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create addThread object correctly', () => {
        const payload = {
            threadId: 'thread-123',
        };

        const addThread = new GetThread(payload);

        expect(addThread.threadId).toEqual(payload.threadId);
    });
});