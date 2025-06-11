const GetThread = require('../../Domains/threads/entities/GetThread');

class GetThreadUseCase {
    constructor({ threadRepository, commentRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
    }

    async execute(useCasePayload) {
        const { thread_id } = useCasePayload;
        const DetailThread = await this._threadRepository.getThreadById(thread_id);
        const comments = await this._commentRepository.getCommentsByThreadId(thread_id);
        return { ...DetailThread, comments };
    }
}

module.exports = GetThreadUseCase;