/* istanbul ignore file */

const { createContainer } = require('instances-container');

// external agency
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const pool = require('./database/postgres/pool');

// service (repository, helper, manager, etc)
const UserRepository = require('../Domains/users/UserRepository');
const ThreadRepository = require('../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('./repository/ThreadRepositoryPostgres');
const CommentRepository = require('../Domains/comments/CommentRepository');
const CommentRepositoryPostgres = require('./repository/CommentRepositoryPostgres');
const RepliesRepository = require('../Domains/replies/RepliesRepository');
const RepliesRepositoryPostgres = require('./repository/RepliesRepositoryPostgres');
const LikesRepository = require('../Domains/likes/LikesRepository');
const LikesRepositoryPostgres = require('./repository/LikesRepositoryPostgres');

const PasswordHash = require('../Applications/security/PasswordHash');
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres');
const BcryptPasswordHash = require('./security/BcryptPasswordHash');

// use case
const AddUserUseCase = require('../Applications/use_case/AddUserUseCase');
const AuthenticationTokenManager = require('../Applications/security/AuthenticationTokenManager');
const JwtTokenManager = require('./security/JwtTokenManager');
const LoginUserUseCase = require('../Applications/use_case/LoginUserUseCase');
const AuthenticationRepository = require('../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('./repository/AuthenticationRepositoryPostgres');
const LogoutUserUseCase = require('../Applications/use_case/LogoutUserUseCase');
const RefreshAuthenticationUseCase = require('../Applications/use_case/RefreshAuthenticationUseCase');

// threads use case
const AddThreadUseCase = require('../Applications/use_case/AddThreadUseCase');
const GetThreadUseCase = require('../Applications/use_case/GetThreadUseCase');

// comments use case
const AddCommentUseCase = require('../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../Applications/use_case/DeleteCommentUseCase');

// replies use case
const AddReplyUseCase = require('../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../Applications/use_case/DeleteReplyUseCase');

// likes use case
const AddLikeUseCase = require('../Applications/use_case/AddLikeUseCase');

// creating container
const container = createContainer();

// registering services and repository
container.register([
    {
        key: UserRepository.name,
        Class: UserRepositoryPostgres,
        parameter: {
            dependencies: [
                {
                    concrete: pool,
                },
                {
                    concrete: nanoid,
                },
            ],
        },
    },
    {
        key: AuthenticationRepository.name,
        Class: AuthenticationRepositoryPostgres,
        parameter: {
            dependencies: [
                {
                    concrete: pool,
                },
            ],
        },
    },
    {
        key: PasswordHash.name,
        Class: BcryptPasswordHash,
        parameter: {
            dependencies: [
                {
                    concrete: bcrypt,
                },
            ],
        },
    },
    {
        key: AuthenticationTokenManager.name,
        Class: JwtTokenManager,
        parameter: {
            dependencies: [
                {
                    concrete: Jwt.token,
                },
            ],
        },
    },
    {
        key: ThreadRepository.name,
        Class: ThreadRepositoryPostgres,
        parameter: {
            dependencies: [
                {
                    concrete: pool,
                },
                {
                    concrete: nanoid,
                },
            ],
        },
    },
    {
        key: CommentRepository.name,
        Class: CommentRepositoryPostgres,
        parameter: {
            dependencies: [
                {
                    concrete: pool,
                },
                {
                    concrete: nanoid,
                },
            ],
        },
    },
    {
        key: RepliesRepository.name,
        Class: RepliesRepositoryPostgres,
        parameter: {
            dependencies: [
                {
                    concrete: pool,
                },
                {
                    concrete: nanoid,
                },
            ],
        },
    },
    {
        key: LikesRepository.name,
        Class: LikesRepositoryPostgres,
        parameter: {
            dependencies: [
                {
                    concrete: pool
                }
            ]
        }
    }
]);

// registering use cases
container.register([
    {
        key: AddUserUseCase.name,
        Class: AddUserUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
                {
                    name: 'passwordHash',
                    internal: PasswordHash.name,
                },
            ],
        },
    },
    {
        key: LoginUserUseCase.name,
        Class: LoginUserUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'userRepository',
                    internal: UserRepository.name,
                },
                {
                    name: 'authenticationRepository',
                    internal: AuthenticationRepository.name,
                },
                {
                    name: 'authenticationTokenManager',
                    internal: AuthenticationTokenManager.name,
                },
                {
                    name: 'passwordHash',
                    internal: PasswordHash.name,
                },
            ],
        },
    },
    {
        key: LogoutUserUseCase.name,
        Class: LogoutUserUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'authenticationRepository',
                    internal: AuthenticationRepository.name,
                },
            ],
        },
    },
    {
        key: RefreshAuthenticationUseCase.name,
        Class: RefreshAuthenticationUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'authenticationRepository',
                    internal: AuthenticationRepository.name,
                },
                {
                    name: 'authenticationTokenManager',
                    internal: AuthenticationTokenManager.name,
                },
            ],
        },
    },
    {
        key: AddThreadUseCase.name,
        Class: AddThreadUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'threadRepository',
                    internal: ThreadRepository.name,
                },
            ],
        },
    },
    {
        key: AddCommentUseCase.name,
        Class: AddCommentUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'commentRepository',
                    internal: CommentRepository.name,
                },
                {
                    name: 'threadRepository',
                    internal: ThreadRepository.name,
                },
            ],
        },

    },

    {
        key: DeleteCommentUseCase.name,
        Class: DeleteCommentUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'commentRepository',
                    internal: CommentRepository.name,
                },
                {
                    name: 'threadRepository',
                    internal: ThreadRepository.name,
                },
            ],
        },
    },

    {
        key: GetThreadUseCase.name,
        Class: GetThreadUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'threadRepository',
                    internal: ThreadRepository.name,
                },
                {
                    name: 'commentRepository',
                    internal: CommentRepository.name,
                },
                {
                    name: 'repliesRepository',
                    internal: RepliesRepository.name,
                },
                {
                    name: 'likeRepository',
                    internal: LikesRepository.name
                }
            ],
        },
    },
    {
        key: AddReplyUseCase.name,
        Class: AddReplyUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'threadRepository',
                    internal: ThreadRepository.name,
                },
                {
                    name: 'commentRepository',
                    internal: CommentRepository.name,
                },
                {
                    name: 'repliesRepository',
                    internal: RepliesRepository.name,
                },
            ],
        },
    },
    {
        key: DeleteReplyUseCase.name,
        Class: DeleteReplyUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'threadRepository',
                    internal: ThreadRepository.name,
                },
                {
                    name: 'commentRepository',
                    internal: CommentRepository.name,
                },
                {
                    name: 'repliesRepository',
                    internal: RepliesRepository.name,
                },
            ],
        },
    },
    {
        key: AddLikeUseCase.name,
        Class: AddLikeUseCase,
        parameter: {
            injectType: 'destructuring',
            dependencies: [
                {
                    name: 'threadRepository',
                    internal: ThreadRepository.name,
                },
                {
                    name: 'commentRepository',
                    internal: CommentRepository.name,
                },
                {
                    name: 'likeRepository',
                    internal: LikesRepository.name,
                },
            ],
        },
    },
]);

module.exports = container;
