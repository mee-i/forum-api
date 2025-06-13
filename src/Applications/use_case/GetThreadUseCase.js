const GetThread = require('../../Domains/threads/entities/GetThread');

class GetThreadUseCase {
    constructor({ threadRepository, commentRepository, repliesRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._repliesRepository = repliesRepository;
    }

    async execute(useCasePayload) {
        const { thread_id } = useCasePayload;
        const DetailThread = await this._threadRepository.getThreadById(thread_id);
        const comments = await this._commentRepository.getCommentsByThreadId(thread_id);
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await this._repliesRepository.getRepliesByCommentId(comment.id);
                return {
                    ...comment,
                    replies,
                };
            })
        );

        return { ...DetailThread, comments: commentsWithReplies };
    }
}

module.exports = GetThreadUseCase;