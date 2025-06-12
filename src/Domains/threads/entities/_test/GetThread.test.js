const GetThread = require('../GetThread');

describe('a GetThread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            
        };

        expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            thread_id: {}
        };

        expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create GetThread object correctly', () => {
        const payload = {
            thread_id: "thread-123"
        };

        const getThread = new GetThread(payload);

        expect(getThread.thread_id).toEqual(payload.thread_id);
    });
});