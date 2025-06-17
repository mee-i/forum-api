const AddLikeUseCase = require('../AddLikeUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikesRepository = require('../../../Domains/likes/LikesRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddLike = require('../../../Domains/likes/entities/AddLike');

describe('AddLikeUseCase', () => {
  it('should throw error if thread id not found', async () => {
    // Arrange
    const useCasePayload = {
      comment_id: 'comment-123',
      owner: 'user-123',
    };
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockLikesRepository = new LikesRepository();

    mockThreadRepository.verifyThread = jest.fn(() => Promise.reject(new NotFoundError('Thread tidak ditemukan')));

    const addReplyUseCase = new AddLikeUseCase({ commentRepository: mockCommentRepository, threadRepository: mockThreadRepository, likeRepository: mockLikesRepository });

    // Action
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(NotFoundError);
  });

  it('should throw error if comment id not found', async () => {
    const useCasePayload = {
      comment_id: 'comment-123',
      owner: 'user-123',
    };
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockLikesRepository = new LikesRepository();

    mockThreadRepository.verifyThread = jest.fn(() => Promise.resolve([1]));
    mockCommentRepository.verifyComment = jest.fn(() => Promise.reject(new NotFoundError('Komentar tidak ditemukan')))

    const addReplyUseCase = new AddLikeUseCase({ commentRepository: mockCommentRepository, threadRepository: mockThreadRepository, likeRepository: mockLikesRepository });

    // Action
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(NotFoundError);
  });
  it('should orchestrating the add like action correctly', async () => {
    // Arrange
    const useCasePayload = {
      comment_id: 'comment-123',
      owner: 'user-123',
    };

    const mockComment = new AddedComment({
      id: 'comment-123',
      content: 'This is comment',
      owner: useCasePayload.owner,
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockLikesRepository = new LikesRepository();

    mockThreadRepository.verifyThread = jest.fn(() => Promise.resolve());

    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(
      mockComment,
    ));

    mockCommentRepository.verifyComment = jest.fn().mockImplementation(() => Promise.resolve([1]));

    mockLikesRepository.addLike = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockLikesRepository.isExists = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockLikesRepository.isExists = jest.fn().mockImplementation(() => Promise.resolve());

    const getLikeUseCase = new AddLikeUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikesRepository,
    });

    // Action
    await getLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThread).toBeCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(useCasePayload.comment_id, useCasePayload.thread_id);
    expect(mockLikesRepository.addLike).toBeCalledWith(new AddLike({
      thread_id: useCasePayload.thread_id,
      comment_id: useCasePayload.comment_id,
      owner: useCasePayload.owner,
    }));

  });
});
