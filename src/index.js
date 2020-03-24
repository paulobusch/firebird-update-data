const { Config, FdbConfig } = require('../config');

var Firebird = require('node-firebird');
const _ = require('lodash');

console.log('Atualizando...');

const recursive = (partial, time) => {
    if (partial * Config.limit >= Config.total) {
        console.log('Fim...');
        return;
    }
    const offset = partial * Config.limit;
    const pool = Firebird.pool(5, FdbConfig);
    const timeStr = time ? ` Time: ${(new Date() - time) / 1000} s` : '';
    console.log('Processando: ' + (offset + Config.limit) + ' / ' + Config.total + timeStr);
    const startTime = new Date();
    pool.get((err, db) => {
        if (err) throw err;
        const query = `UPDATE CONSULTA SET CON_SOBRENOME=RIGHT(CON_NOME, POSITION(' ', REVERSE(CON_NOME))) where CON_CODIGO >= ${offset} and CON_CODIGO < ${offset + Config.limit};`;
        db.query(query, null, (err, result) => {
            if (err) throw err;
            db.detach();
            recursive(partial + 1, startTime);
        });
    });
}

recursive(0, null);
