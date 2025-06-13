const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ commentRepository, threadRepository, repliesRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._repliesRepository = repliesRepository;
  }

  async execute(useCasePayload) {
    const addReply = new AddReply(useCasePayload);
    await this._threadRepository.verifyThread(addReply.thread_id);
    await this._commentRepository.verifyComment(addReply.comment_id, addReply.thread_id);
    return this._repliesRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
