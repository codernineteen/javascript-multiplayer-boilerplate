import { geckos, GeckosServer } from "@geckos.io/server";

const io = geckos();

io.listen(3000);

io.onConnection((channel) => {
  channel.onDisconnect(() => {
    console.log(`${channel.id} got disconnected`);
  });

  channel.on("move", (data) => {
    console.log(data);
  });
});
