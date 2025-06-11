const AuthenticationTestHelper = {
  async getAccessToken(
    server,
    user = {
      username: 'JohnDoe123',
      password: 'supersecretpassword',
      fullname: 'John Doe',
    }
  ) {
    const registeredUser = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: user.username,
        password: user.password,
        fullname: user.fullname,
      },
    });

    const authentication = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: user.username,
        password: user.password,
      },
    });

    const { data: { accessToken } } = JSON.parse(authentication.payload);
    const { data: { addedUser: { id: userId } } } = JSON.parse(registeredUser.payload);

    return { userId, accessToken };
  },
};

module.exports = AuthenticationTestHelper;
