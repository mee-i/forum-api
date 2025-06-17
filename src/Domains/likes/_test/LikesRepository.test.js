const LikesRepository = require('../LikesRepository');

describe('LikesRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    const likesRepository = new LikesRepository();

    await expect(likesRepository.addLike({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likesRepository.isExists('', '')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likesRepository.deleteLikeByCommentIdAndOwner('', '')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
