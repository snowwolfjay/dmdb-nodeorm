import { RepoManager } from "./base";
import { BehaviorSubject, firstValueFrom, filter, timeout } from "rxjs";
export class TableBase {
  private ready$$ = new BehaviorSubject(false);
  private allFields = [] as string[];
  constructor(
    private repoMane: RepoManager,
    public readonly name: string,
    public rowDef: string[]
  ) {
    //
    this.prepare();
    this.allFields = rowDef.map((e) => e.split("")[0]);
  }
  private async prepare() {
    const sql = `CREATE TABLE IF NOT EXISTS ${this.name} (  
            ${this.rowDef.join(",")}
        )
        `;
    await this.repoMane.conn.execute(sql);
    console.info(`prepare ${this.name} ok:
        ${sql}
        `);
    this.ready$$.next(true);
  }

  public ready(timeoutMs = 30000) {
    return firstValueFrom(
      this.ready$$.pipe(
        filter((e) => !!e),
        timeout(timeoutMs)
      )
    );
  }
  public async create(
    fields: { [key: string]: any },
    opts?: { commit?: boolean }
  ) {
    await this.ready();
    const conn = this.repoMane.conn;
    const cols = Object.keys(fields);
    const args = cols.map((key) => ({ val: fields[key] }));
    const pats = cols.map((_, i) => `:${i + 1}`);
    const sql = `INSERT INTO ${this.name}(${cols.join(",")}) VALUES(${pats.join(
      ","
    )})`;
    console.log(`execute insert sql:
            ${sql}
        `);
    console.log(args);
    const result = await conn.execute(sql, args);
    opts?.commit !== false && conn.execute("commit;");
    return result;
  }
  public async commit() {
    const conn = this.repoMane.conn;
    await conn.execute("commit;");
  }
}
