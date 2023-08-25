import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import Config from "../components/Config.js";

async function getPic(imageUrl) {
    let agent = null;
    if ((Config.getConfig()).proxy) {
      agent = new HttpsProxyAgent((Config.getConfig()).proxy_url, {
        keepAlive: true,
      });
    }
    const res = await fetch(imageUrl, {
      agent: agent,
    });
    const base64 = await res.arrayBuffer().then((buffer) => {
      return Buffer.from(buffer).toString("base64");
    });
    return base64;
  }
  
  export default getPic;