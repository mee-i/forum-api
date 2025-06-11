class GetThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { thread_id } = payload;

    this.thread_id = thread_id;
  }

  _verifyPayload({ thread_id } ) {
    if (!thread_id) {
      throw new Error('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof thread_id !== 'string') {
      throw new Error('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetThread;
