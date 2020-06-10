const { Config, Columns } = require('../config');
const { Query } = require('./utils/query');
const { Storage } = require('./utils/storage');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

var Firebird = require('node-firebird');
const mysql = require('sync-mysql');
const storage = new Storage('config.ini');
const connection = new mysql({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const getText = (txt) => {
    if (!txt) return null;
    return txt
        .replace(/[^a-z^ ]/gi, '');
}
const getLastName = (full_name) => {
    if (!full_name) return null;
    const parts = full_name.split(' ');
    if (parts.length === 1) return null;
    return parts[parts.length - 1];
}
const getNumber = (txt) => {
    if (!txt) return null;
    return txt
        .replace(/[^0-9]/gi, '');
}
const castStr = (raw) => raw ? raw.toString('utf-8') : raw;
const castDate = (raw) => raw ? new Date(castStr(raw)) : raw;

console.log('importando...');
const recursive = (offset, timeQuery, timeInsert) => {
    if (offset >= Config.total) {
        console.log('Fim...');
        return;
    }
    const pool = Firebird.pool(5, {
        database: process.env.FDB_DB_PATH,
        user: process.env.FDB_DB_USER,
        password: process.env.FDB_DB_PASS
    });
    const timeStr = ` Time Query: ${timeQuery} s | Time Insert: ${timeInsert} s`;
    console.log('Processando: ' + (offset + Config.limit) + ' / ' + Config.total + timeStr);
    pool.get((err, db) => {
        if (err) throw err;
        const query = `
            select 
                CON_CPFCNPJ as CPF_CNPJ,
                CON_NOME as FULL_NAME,
                CON_ENDERECO as ADDRESS,
                CON_COMPLEMENTO as COMPLEMENT,
                CON_BAIRRO as NEIGHBORHOOD,
                CON_CEP as CEP,
                CON_CIDADE as CITY_NAME,
                CON_UF as STATE_UF,
                CON_DATANASCIMENTO as BIRTH_DATE,
                CON_FONE as PHONE
            from consulta
            where CON_CODIGO >= ${offset} and CON_CODIGO < ${offset + Config.limit};`;
        const startQuery = new Date();
        db.query(query, null, (err, list) => {
            if (err) throw err;
            db.detach();
            const durationQuery = (new Date() - startQuery) / 1000;
            const ImportRows = [];
            for (let index in list) {
                const raw = list[index];
                const cpf_cnpj = getNumber(castStr(raw['CPF_CNPJ'])) || '';
                const full_name = getText(castStr(raw['FULL_NAME']));
                ImportRows.push([
                    full_name,
                    getLastName(full_name),
                    cpf_cnpj.length === 11 ? cpf_cnpj : null,
                    cpf_cnpj.length === 14 ? cpf_cnpj : null,
                    castStr(raw['ADDRESS']),
                    castStr(raw['COMPLEMENT']),
                    castStr(raw['NEIGHBORHOOD']),
                    castStr(raw['CEP']),
                    getText(castStr(raw['CITY_NAME'])),
                    getText(castStr(raw['STATE_UF'])),
                    castDate(raw['BIRTH_DATE']),
                    castStr(raw['PHONE'])
                ]);
            }
            const queryInsert = Query.get('peoples_big_data', Columns.peoples, ImportRows);
            const startInsert = new Date();
            connection.query(queryInsert);
            storage.set({ count: offset + Config.limit });
            const durationInsert = (new Date() - startInsert) / 1000;
            recursive(offset + Config.limit, durationQuery, durationInsert);
        });
    });
}

const conf = storage.get({ count: 0 });
recursive(conf.count, null, null);
