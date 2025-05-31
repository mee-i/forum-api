
class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { threadId, content } = payload;

    this.threadId = threadId;
    this.content = content;
  }

  _verifyPayload({ threadId, content }) {
    if (!threadId || !content) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof content !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComment;