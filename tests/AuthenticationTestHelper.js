const AuthenticationTestHelper = {
    async getAccessToken(server) {
        const registeredUser = await server.inject({
            method: 'POST',
            url: '/users',
            payload: {
                username: 'JohnDoe123',
                password: 'supersecretpassword',
                fullname: 'John Doe'
            }
        });

        const authentication = await server.inject({
            method: 'POST',
            url: '/authentications',
            payload: {
                username: 'JohnDoe123',
                password: 'supersecretpassword'
            }
        });
        
        const { data: { accessToken } } = JSON.parse(authentication.payload);
        const { data: { addedUser: { id: userId } } } = JSON.parse(registeredUser.payload);
        return { userId, accessToken };
    }
};

module.exports = AuthenticationTestHelper;