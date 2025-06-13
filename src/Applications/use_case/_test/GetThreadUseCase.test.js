const GetThreadUseCase = require("../GetThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const GetThread = require("../../../Domains/threads/entities/GetThread");
const DetailThread = require("../../../Domains/threads/entities/DetailThread");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const RepliesRepository = require("../../../Domains/replies/RepliesRepository");
const replies = require("../../../Interfaces/http/api/replies");

describe("GetThreadUseCase", () => {
    it("should orchestrate the add thread action correctly", async () => {
        // Arrange
        const useCasePayload = {
            thread_id: "thread-123"
        };

        const mockThread = new DetailThread({
            id: "thread-123",
            title: "This is title",
            body: "This is body",
            date: "2025-06-09T11:06:24.541Z",
            username: "Dicoding",
        });

        const mockReplies = [
            {
                id: "reply-123",
                content: "This is a reply",
                date: "2025-06-09T12:06:24.541Z",
                username: "JohnDoe123"
            },
            {
                id: "reply-124",
                content: "This is a reply",
                date: "2025-06-09T13:06:24.541Z",
                username: "JohnDoe123"
            }
        ]

        const mockComments = [
            {
                id: "comment-123",
                content: "This is content",
                date: "2025-06-09T11:06:24.541Z",
                is_delete: false,
                username: "JohnDoe123",
            },
            {
                id: "comment-124",
                content: "This is content",
                date: "2025-06-09T11:06:24.541Z",
                is_delete: false,
                username: "JohnDoe123",
            }
        ]

        const expectedComments = [
            {
                id: "comment-123",
                content: "This is content",
                date: "2025-06-09T11:06:24.541Z",
                is_delete: false,
                username: "JohnDoe123",
                replies: mockReplies
            },
            {
                id: "comment-124",
                content: "This is content",
                date: "2025-06-09T11:06:24.541Z",
                is_delete: false,
                username: "JohnDoe123",
                replies: mockReplies
            }
        ]

        // console.log(mockThread);

        /** creating dependency of use case */
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockRepliesRepository = new RepliesRepository();

        /** mocking needed function */
        mockThreadRepository.getThreadById = jest.fn()
            .mockImplementation(() => Promise.resolve(mockThread));

        mockCommentRepository.getCommentsByThreadId = jest.fn()
            .mockImplementation(() => Promise.resolve(mockComments));

        mockRepliesRepository.getRepliesByCommentId = jest.fn().mockImplementation(() => Promise.resolve(mockReplies));

        /** creating use case instance */
        const getThreadUseCase = new GetThreadUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            repliesRepository: mockRepliesRepository,
        });

        // Action
        const thread = await getThreadUseCase.execute(useCasePayload);

        // Assert
        //       id: "thread-123",
        //   title: "This is title",
        //   body: "This is body",
        //   date: "2025-06-09T11:06:24.541Z",
        //   username: "Dicoding",
        // }
        expect(thread).toStrictEqual({
            id: "thread-123",
            title: "This is title",
            body: "This is body",
            date: "2025-06-09T11:06:24.541Z",
            username: "Dicoding",
            comments: expectedComments
        });

        // console.log(mockThreadRepository.addThread.mock.calls);

        expect(mockThreadRepository.getThreadById).toBeCalledWith("thread-123");
    });
});
