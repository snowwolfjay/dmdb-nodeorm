import db from "dmdb";
export class RepoManager {
  static map = {} as any
  constructor(public readonly conn: db.Connection) {
    //
  }
  getClass<T=any>(name: string) {
    return new RepoManager.map[name](this);
  }

  getAllTables() {
    const tables = Object.keys(RepoManager.map);
    return tables;
  }
}
