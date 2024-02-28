"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepoManager = void 0;
var RepoManager = /** @class */ (function () {
    function RepoManager(conn) {
        this.conn = conn;
        //
    }
    RepoManager.prototype.getClass = function (name) {
        return new RepoManager.map[name](this);
    };
    RepoManager.prototype.getAllTables = function () {
        var tables = Object.keys(RepoManager.map);
        return tables;
    };
    RepoManager.map = {};
    return RepoManager;
}());
exports.RepoManager = RepoManager;
