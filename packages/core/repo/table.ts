import { RepoManager } from "./base";
import { BehaviorSubject, firstValueFrom, filter, timeout } from "rxjs"

export class TableBase<T = any> {
    private ready$$ = new BehaviorSubject(false)
    private allFields = [] as string[]
    constructor(private repoMane: RepoManager, public readonly name: string, public rowDef: string[]) {
        // 
        this.prepare()
        this.allFields = rowDef.map(e => e.split(" ")[0])
    }
    private async prepare() {
        const sql = `CREATE TABLE IF NOT EXISTS ${this.name} (  
            ${this.rowDef.join(",")}
        )
        `
        await this.repoMane.conn.execute(sql)
        console.info(`prepare ${this.name} ok:
        ${sql}
        `)
        this.ready$$.next(true)
    }

    public ready(timeoutMs = 30000) {
        return firstValueFrom(this.ready$$.pipe(filter(e => !!e), timeout(timeoutMs)))
    }
    public async create(fields: { [key: string]: any }, opts?: { commit?: boolean }) {
        await this.ready()
        const conn = this.repoMane.conn
        const cols = Object.keys(fields)
        const args = cols.map(key => ({ val: fields[key] }))
        const pats = cols.map((_, i) => `:${i + 1}`)
        const sql = `INSERT INTO ${this.name}(${cols.join(",")}) VALUES(${pats.join(',')})`
        console.log(`execute insert sql:
            ${sql}
        `)
        console.log(args)
        const result = await conn.execute(
            sql,
            args
        );
        opts?.commit !== false && conn.execute("commit;");
        return result
    }
    public async read(opts: {
        fields?: string[],
        sql?: string,
        condition?: string
    }) {
        await this.ready()
        const conn = this.repoMane.conn
        const fields = opts.fields || this.allFields;
        let sql = ""
        if (opts.sql) {
            sql = opts.sql
        } else {
            sql = `SELECT ${fields.join(",")} FROM ${this.name} ${opts.condition || ''}`
        }
        console.info(`use sql:
        ${sql}
        `)
        const result = await conn.execute(sql);

        return result.rows!.map(vals => fields.reduce((obj, key, idx) => {
            obj[key] = vals[idx]
            return obj
        }, {} as any)) as T[]
    }
    public async update(query: string, newFields: { [key: string]: any }, opts?: { commit?: boolean, queryParams?: any }) {
        await this.ready()
        const conn = this.repoMane.conn
        const keyValList = Array.from(Object.entries(newFields))
        const setStr = keyValList.map(([key, val]) => `${key}=:${key}`)
        const args = keyValList.reduce((obj, [key, val]) => {
            obj[key] = {
                val
            }
            return obj
        }, opts?.queryParams ?? {} as any)
        const sql = `UPDATE ${this.name} SET ${setStr} ${query}`;
        console.info(`use sql:
        ${sql}
        `)
        // 按名称绑定变量
        await conn.execute(sql, args);
        opts?.commit !== false && await conn.execute("commit;");
    }
    public async delete(query: string, opts?: { commit?: boolean, queryParams?: any }) {
        await this.ready()
        const conn = this.repoMane.conn

        const sql = `DELETE FROM ${this.name} ${query}`;
        console.info(`use sql:
        ${sql}
        `)
        // 按名称绑定变量
        await conn.execute(sql, opts?.queryParams ?? {});
        opts?.commit !== false && await conn.execute("commit;");
    }
    public async commit() {
        const conn = this.repoMane.conn
        await conn.execute("commit;");
    }
}