import { Midjourney } from "midjourney";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import WebSocket from "isomorphic-ws";
import Log from "../utils/logs.js";
import Config from "../components/Config.js";

const proxyFetch = async (input, init) => {
  const agent = new HttpsProxyAgent((Config.getConfig()).proxy_url, {
    keepAlive: true,
  });
  if (!init) init = {};
  init.agent = agent;
  return fetch(input, init);
};

class ProxyWebSocket extends WebSocket {
  constructor(address, options) {
    const agent = new HttpsProxyAgent((Config.getConfig()).proxy_url, {
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
      ServerId: (Config.getConfig()).server_id,
      ChannelId: (Config.getConfig()).channel_id,
      SalaiToken: (Config.getConfig()).salai_token,
      HuggingFaceToken: (Config.getConfig()).huggingface_token,
      Debug: (Config.getConfig()).debug,
      Ws: true,
      fetch: (Config.getConfig()).proxy ? proxyFetch : fetch,
      WebSocket: (Config.getConfig()).proxy ? ProxyWebSocket : WebSocket,
    });
    await client.init();
    global.mjClient = client;
  } catch (err) {
    Log.e(err)
  }
}