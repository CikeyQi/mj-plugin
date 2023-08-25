import { Midjourney } from "midjourney";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import WebSocket from "isomorphic-ws";
import Log from "../utils/logs.js";

const proxyFetch = async (input, init) => {
  const agent = new HttpsProxyAgent("http://127.0.0.1:7890", {
    keepAlive: true,
  });
  if (!init) init = {};
  init.agent = agent;
  return fetch(input, init);
};

class ProxyWebSocket extends WebSocket {
  constructor(address, options) {
    const agent = new HttpsProxyAgent("http://127.0.0.1:7890", {
      keepAlive: true,
    });
    if (!options) options = {};
    options.agent = agent;
    super(address, options);
  }
}

export async function Main() {
  try {
    const client = new Midjourney({
      ServerId: "1125079547856027698",
      ChannelId: "1125079547856027701",
      SalaiToken: "OTQ0NjU1NTgyNDY2NTY0MTk2.Ghi8Y7.Id_I_2zcBDderh4Ta_YmdJjUdOniQNeaNT5MUk",
      HuggingFaceToken: "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",
      Debug: true,
      Ws: true,
      fetch: proxyFetch,
      WebSocket: ProxyWebSocket,
    });
    await client.init();
    global.mjClient = client;
  } catch (err) {
    Log.e(err)
  }
}