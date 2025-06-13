const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
    it('should orchestrate the delete comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            thread_id: 'thread-123',
            comment_id: 'comment-123',
            owner: 'user-123'
        };
        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve([1]));
        mockCommentRepository.verifyComment = jest.fn().mockImplementation(() => Promise.resolve([1]));
        mockCommentRepository.verifyCommentOwner = jest.fn().mockImplementation(() => Promise.resolve([1]));
        mockCommentRepository.deleteCommentById = jest.fn().mockImplementation(() => Promise.resolve([1]));

        const deleteCommentUseCase = new DeleteCommentUseCase({ commentRepository: mockCommentRepository, threadRepository: mockThreadRepository });

        // Action
        await expect(deleteCommentUseCase.execute(useCasePayload)).resolves.not.toThrow();

        expect(mockThreadRepository.verifyThread).toBeCalledWith(useCasePayload.thread_id);
        expect(mockCommentRepository.verifyComment).toBeCalledWith(useCasePayload.comment_id, useCasePayload.thread_id);
        expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(useCasePayload.comment_id, useCasePayload.owner);
        expect(mockCommentRepository.deleteCommentById).toBeCalledWith(useCasePayload.comment_id);
    });
});