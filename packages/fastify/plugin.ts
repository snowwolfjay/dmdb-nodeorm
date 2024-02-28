import { FastifyPluginAsync, FastifyRequest } from "fastify";
import {
  RepoManager,
  TableBase,
  connectdmdb,
  getConnection,
} from "@dmorm/core";
import fp from "fastify-plugin";

const Plugin: FastifyPluginAsync<{
  map: { [key: string]: typeof TableBase };
}> = async (server, opts): Promise<void> => {
  let conn: any;
  let repoManager: RepoManager;
  RepoManager.map = opts?.map;
  if (!opts.map) {
    throw new Error(`miss repo tables map`);
  }
  await connectdmdb();
  server.decorateRequest("dmConnection", async () => {
    return conn ? conn : (conn = await getConnection());
  });
  server.decorateRequest("repoManager", async () => {
    conn = conn || (await getConnection());
    return repoManager || new RepoManager(conn);
  });
  server.addHook("onSend", async () => {
    try {
      conn?.close();
    } catch (error) {
      console.log(`${typeof conn?.close}`);
    }
  });
};

export default fp(Plugin, { name: "dmdb-plugin" });

declare module "fastify" {
  interface FastifyRequest {
    dmConnection: () => ReturnType<typeof getConnection>;
    repoManager: () => Promise<RepoManager>;
  }
}
