const AddLike = require('../../Domains/likes/entities/AddLike');

class AddLikeUseCase {
    constructor({ threadRepository, commentRepository, likeRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._likeRepository = likeRepository;
    }
    async execute(useCasePayload) {
        const { thread_id, comment_id, owner } = useCasePayload;
        const addLike = new AddLike({ comment_id, owner});
        await this._threadRepository.verifyThread(thread_id);
        await this._commentRepository.verifyComment(comment_id, thread_id);
        const isLiked = await this._likeRepository.isExists(comment_id, owner);
        if (isLiked) {
            await this._likeRepository.deleteLikeByCommentIdAndOwner(comment_id, owner);
        } else {
            await this._likeRepository.addLike(addLike);
        }
    }
}

module.exports = AddLikeUseCase;
