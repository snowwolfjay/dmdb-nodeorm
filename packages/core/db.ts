import db from "dmdb"

let pool: db.Pool
export async function connectdmdb() {
    pool = await createPool();
}

//创建连接池
async function createPool() {
    try {
        return db.createPool({
            connectString: "dm://SYSDBA:SYSDBA\@localhost:5236?autoCommit=false",
            poolMax: 10,
            poolMin: 1
        });
    } catch (err) {
        throw new Error("createPool error: " + err.message);
    }
}
// 
//获取数据库连接
export async function getConnection() {
    try {
        return pool.getConnection();
    } catch (err) {
        throw new Error("getConnection error: " + err.message);
    }
}
