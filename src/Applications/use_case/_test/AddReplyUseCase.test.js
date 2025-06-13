const AddReplyUseCase = require('../AddReplyUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');

describe('AddReplyUseCase', () => {
  it('should throw error if thread id not found', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      content: 'This is reply',
      owner: 'user-123',
    };
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockRepliesRepository = new RepliesRepository();

    mockThreadRepository.verifyThread = jest.fn(() =>
      Promise.reject(new NotFoundError('Thread not found')),
    );

    const addReplyUseCase = new AddReplyUseCase({commentRepository: mockCommentRepository, threadRepository: mockThreadRepository, repliesRepository: mockRepliesRepository});

    // Action
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(NotFoundError);
  });

  it('should throw error if comment id not found', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      content: 'This is reply',
      owner: 'user-123',
    };
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockRepliesRepository = new RepliesRepository();

    mockThreadRepository.verifyThread = jest.fn(() =>
      Promise.resolve([1]),
    );

    mockCommentRepository.verifyComment = jest.fn(() => Promise.reject(new NotFoundError))

    const addReplyUseCase = new AddReplyUseCase({commentRepository: mockCommentRepository, threadRepository: mockThreadRepository, repliesRepository: mockRepliesRepository});

    // Action
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(NotFoundError);
  });
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      content: 'This is reply',
      owner: 'user-123',
    };

    const mockComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    // console.log(mockThread);

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockRepliesRepository = new RepliesRepository();

    mockThreadRepository.verifyThread = jest.fn(() =>
      Promise.resolve(),
    );

    mockCommentRepository.addComment = jest.fn().mockImplementation(() =>
      Promise.resolve(
        mockComment
      ),
    );

    mockCommentRepository.verifyComment = jest.fn().mockImplementation(() => Promise.resolve([1]))

    mockRepliesRepository.addReply = jest.fn().mockImplementation(() => 
      Promise.resolve(
        mockReply
      ),
    );

    const getReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      repliesRepository: mockRepliesRepository
    });

    // Action
    const addedReply = await getReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));

    // console.log(mockThreadRepository.addThread.mock.calls);

    expect(mockRepliesRepository.addReply).toBeCalledWith(new AddReply({
      thread_id: useCasePayload.thread_id,
      comment_id: useCasePayload.comment_id,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });
});
