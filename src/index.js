const { Config, FdbConfig } = require('../config');

var Firebird = require('node-firebird');
const _ = require('lodash');

console.log('Atualizando...');

const recursive = (offset, time) => {
    if (offset >= Config.total) {
        console.log('Fim...');
        return;
    }
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
            recursive(offset + Config.limit, startTime);
        });
    });
}

recursive(50000000, null);
