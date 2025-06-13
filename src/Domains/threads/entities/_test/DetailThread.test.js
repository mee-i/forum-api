const DetailThread = require('../DetailThread');

describe('a AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {

    };

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: {},
      title: 123,
      body: '123',
      date: '123',
      username: 4,
    };

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'This is thread',
      body: 'This is the body of the thread',
      date: '2025-06-09T07:26:21.338Z',
      username: 'User 123',
    };

    const addThread = new DetailThread(payload);

    expect(addThread.id).toEqual(payload.id);
    expect(addThread.title).toEqual(payload.title);
    expect(addThread.body).toEqual(payload.body);
    expect(addThread.date).toEqual(payload.date);
    expect(addThread.username).toEqual(payload.username);
  });
});
