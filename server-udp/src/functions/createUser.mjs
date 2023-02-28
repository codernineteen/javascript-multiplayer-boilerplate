const createUser = (channel) => {
  let user = {
    userId: channel.id,
    pos: [Math.random() * 5, 0, Math.random() * 5],
    quat: [0, 0, 0, 1],
    state: undefined,
    input: {
      Forward: false,
      Backward: false,
      Left: false,
      Right: false,
      Shift: false,
      Space: false,
    },
    channel: channel,

    broadcast: function () {
      channel.broadcast.emit("transform update", {
        userId: user.userId,
        pos: user.pos,
        quat: user.quat,
        state: user.state,
        input: user.input,
      });
    },

    cleanup: function () {
      channel.broadcast.emit("cleanup mesh", channel.id);
    },
  };

  channel.emit("initialize", {
    userId: user.userId,
    pos: user.pos,
    quat: user.quat,
    state: user.state,
    input: user.input,
  });

  channel.on("transform update", (data) => {
    const { pos, quat, state, input } = data;
    user.pos = pos;
    user.quat = quat;
    user.state = state;
    user.input = input;
    user.broadcast();
  });

  user.broadcast();

  return user;
};

export { createUser };
