class DeleteCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const { comment_id, thread_id, owner } = useCasePayload;
        await this._threadRepository.verifyThread(thread_id);
        await this._commentRepository.verifyComment(comment_id, thread_id);              
        await this._commentRepository.verifyCommentOwner(comment_id, owner);
        await this._commentRepository.deleteCommentById(comment_id);
    }
}

module.exports = DeleteCommentUseCase;