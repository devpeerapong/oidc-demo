import fs from "fs/promises";
import { Provider } from "oidc-provider";
import morgan from "morgan";
import express from "express";
import { LowdbAdapter } from "./LowdbAdapter.mjs";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

const jwk = JSON.parse(await fs.readFile("./keys/private.jwk", "utf-8"));
const oidc = new Provider("http://localhost:5000", {
  adapter: LowdbAdapter,
  jwks: {
    keys: [jwk],
  },
  clients: [
    {
      client_id: "id",
      client_secret: "secret",
      redirect_uris: [
        "https://jwt.io",
        "https://oauth.pstmn.io/v1/callback",
        "https://oauthdebugger.com/debug",
        "https://oidcdebugger.com/debug",
      ],
      response_types: ["code", "code id_token"],
      grant_types: [
        "authorization_code",
        "refresh_token",
        "implicit",
      ],
      token_endpoint_auth_method: "client_secret_post",
      id_token_signed_response_alg: "PS256",
    },
  ],
  cookies: { keys: ["securekey"] },
  routes: { authorization: "/authorize" },
});

app.use(oidc.callback());
app.listen(5000, () => {
  console.log("server running 5000");
});
