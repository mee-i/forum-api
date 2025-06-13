class DeleteReplyUseCase {
  constructor({ repliesRepository, commentRepository, threadRepository }) {
    this._repliesRepository = repliesRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const {
      comment_id, thread_id, reply_id, owner,
    } = useCasePayload;
    await this._threadRepository.verifyThread(thread_id);
    await this._commentRepository.verifyComment(comment_id, thread_id);
    await this._repliesRepository.verifyReply(reply_id, comment_id);
    await this._repliesRepository.verifyReplyOwner(reply_id, owner);
    await this._repliesRepository.deleteReplyById(reply_id);
  }
}

module.exports = DeleteReplyUseCase;
