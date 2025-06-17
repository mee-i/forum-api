const GetThread = require('../../Domains/threads/entities/GetThread');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, repliesRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._repliesRepository = repliesRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { thread_id } = useCasePayload;
    const DetailThread = await this._threadRepository.getThreadById(thread_id);
    const comments = await this._commentRepository.getCommentsByThreadId(thread_id);
    const updatedComments = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._repliesRepository.getRepliesByCommentId(comment.id);
        const likeCount = await this._likeRepository.getLikesCountByCommentId(comment.id)
        const updatedReplies = await Promise.all(
            replies.map(async (reply) => {
                return {
                    id: reply.id,
                    content: reply.is_delete ? "**balasan telah dihapus**" : reply.content,
                    date: reply.date,
                    username: reply.username
                }
            })
        );
        return {
          id: comment.id,
          content: comment.is_delete ? "**komentar telah dihapus**" : comment.content,
          date: comment.date,
          username: comment.username,
          replies: updatedReplies,
          likeCount
        };
      }),
    );

    return { ...DetailThread, comments: updatedComments };
  }
}

module.exports = GetThreadUseCase;
