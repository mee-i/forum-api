class AddLike {
  constructor(payload) {
    this._verifyPayload(payload);

    const { comment_id, owner } = payload;

    this.comment_id = comment_id;
    this.owner = owner;
  }

  _verifyPayload({ comment_id, owner }) {
    if (!comment_id || !owner) {
      throw new Error('ADD_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof comment_id !== 'string' || typeof owner !== 'string') {
      throw new Error('ADD_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddLike;
