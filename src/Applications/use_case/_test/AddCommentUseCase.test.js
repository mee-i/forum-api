const AddCommentUseCase = require('../AddCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  it('should throw error if thread id not found', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      content: 'Content',
      owner: 'user-123',
    };
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThread = jest.fn(() => Promise.reject(new NotFoundError('Thread not found')));

    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(
      new AddedComment({
        id: 'thread-123',
        content: 'Content',
        owner: 'user-123',
      }),
    ));
    const addCommentUseCase = new AddCommentUseCase({ commentRepository: mockCommentRepository, threadRepository: mockThreadRepository });

    // Action
    await expect(addCommentUseCase.execute(useCasePayload)).rejects.toThrowError(NotFoundError);
  });
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread_id: 'thread-123',
      content: 'Content',
      owner: 'user-123',
    };

    const mockComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    // console.log(mockThread);

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThread = jest.fn(() => Promise.resolve());

    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(
      mockComment,
    ));

    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));

    // console.log(mockThreadRepository.addThread.mock.calls);

    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({
      thread_id: useCasePayload.thread_id,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });
});
