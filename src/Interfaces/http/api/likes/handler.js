const autoBind = require('auto-bind');
const AddLikeUseCase = require('../../../../Applications/use_case/AddLikeUseCase');

class CommentsHandler {
    constructor(container) {
        this._container = container;

        autoBind(this);
    }

    async putLikeHandler(request, h) {
        const { id } = request.auth.credentials;
        const { threadId, commentId } = request.params;
        const addLikeUseCase = this._container.getInstance(AddLikeUseCase.name);
        await addLikeUseCase.execute({ thread_id: threadId, comment_id: commentId, owner: id });
        const response = h.response({
            status: 'success',
        });
        response.code(200);
        return response;
    }
}

module.exports = CommentsHandler;
