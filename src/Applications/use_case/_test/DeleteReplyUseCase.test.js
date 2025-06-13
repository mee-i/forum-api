const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      reply_id: 'reply-123',
      owner: 'user-123'
    };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();

    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve([1]));
    mockCommentRepository.verifyComment = jest.fn().mockImplementation(() => Promise.resolve([1]));
    mockRepliesRepository.verifyReply = jest.fn().mockImplementation(() => Promise.resolve([1]));
    mockRepliesRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve([1]));
    mockRepliesRepository.deleteReplyById = jest.fn().mockImplementation(() => Promise.resolve([1]));

    const deleteReplyUseCase = new DeleteReplyUseCase({ repliesRepository: mockRepliesRepository, commentRepository: mockCommentRepository, threadRepository: mockThreadRepository });

    // Action
    await expect(deleteReplyUseCase.execute(useCasePayload)).resolves.not.toThrow();

    expect(mockThreadRepository.verifyThread).toBeCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(useCasePayload.comment_id, useCasePayload.thread_id);
    expect(mockRepliesRepository.verifyReply).toBeCalledWith(useCasePayload.reply_id, useCasePayload.comment_id);
    expect(mockRepliesRepository.verifyReplyOwner).toBeCalledWith(useCasePayload.reply_id, useCasePayload.owner);
    expect(mockRepliesRepository.deleteReplyById).toBeCalledWith(useCasePayload.reply_id);

  });
});