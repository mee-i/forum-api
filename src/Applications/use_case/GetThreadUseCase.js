const DetailThread = require('../../Domains/threads/entities/DetailThread');

class GetThreadUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const detailThread = new DetailThread(useCasePayload);
        return this._threadRepository.getThreadById(detailThread);
    }
}

module.exports = GetThreadUseCase;