class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { threadId, commentId, content } = payload;

    this.threadId = threadId;
    this.commentId = commentId;
    this.content = content;
  }

  _verifyPayload({ threadId, commentId, content }) {
    if (!threadId || !commentId || !content) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof content !== 'string') {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReply;
