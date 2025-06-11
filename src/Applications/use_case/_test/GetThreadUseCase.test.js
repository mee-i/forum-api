const GetThreadUseCase = require("../GetThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const GetThread = require("../../../Domains/threads/entities/GetThread");
const DetailThread = require("../../../Domains/threads/entities/DetailThread");
const CommentRepository = require("../../../Domains/comments/CommentRepository");

describe("GetThreadUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the add thread action correctly", async () => {
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

    const mockComments = [
      {
        id: "comment-123",
        content: "This is content",
        date: "2025-06-09T11:06:24.541Z",
        is_delete: false,
        username: "JohnDoe123"
      },
      {
        id: "comment-124",
        content: "This is content",
        date: "2025-06-09T11:06:24.541Z",
        is_delete: false,
        username: "JohnDoe123"
      }
    ]

    // console.log(mockThread);

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
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
      comments: mockComments
    });

    // console.log(mockThreadRepository.addThread.mock.calls);

    expect(mockThreadRepository.getThreadById).toBeCalledWith("thread-123");
  });
});
