const AddedReply = require('../AddedReply');

describe('a AddedReplly entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'This is a reply',
    };

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: {},
      owner: 'user-123',
    };

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'This is reply',
      owner: 'user-123',
    };

    const addReply = new AddedReply(payload);

    expect(addReply.id).toEqual(payload.id);
    expect(addReply.content).toEqual(payload.content);
    expect(addReply.owner).toEqual(payload.owner);
  });
});
