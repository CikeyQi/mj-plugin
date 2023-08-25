import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

async function getPic (imageUrl) {
    const agent = new HttpsProxyAgent("http://127.0.0.1:7890", {
        keepAlive: true,
    });
    const res = await fetch(imageUrl, {
        agent: agent,
    });
    const base64 = await res.arrayBuffer().then((buffer) => {
        return Buffer.from(buffer).toString("base64");
    });
    return base64;
}

export default getPic;