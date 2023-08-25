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
      ServerId: "",
      ChannelId: "",
      SalaiToken: "",
      HuggingFaceToken: "",
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