const query = {};

query.get = (table, columns, rows) => {
    if (!rows || rows.length === 0)
        return 'select 0;';

    const resultTable = [];
    for (let r in rows) {
        const resultRow = [];
        for (let c in rows[r])
            resultRow.push(query.castCell(rows[r][c]));
        resultTable.push(resultRow);
    }

    const resultInsert = resultTable.map(row => '(' + row.map(cell => [null, undefined].indexOf(cell) === -1 ? `'${cell}'` : 'NULL').join(',') + ')').join(', ');
    return `insert into ${table} (${columns.map(c => "`" + c + "`").join(', ')}) values ${resultInsert};`;
}

query.castCell = (value) => {
    if (value instanceof Date) {
        return value.getFullYear() + '-' + (value.getMonth() + 1) + '-' + value.getDate();
    }

    const type = typeof value;
    if (type === 'boolean') return value ? 1 : 0;
    if (type === 'string') return value.replace(/\W/gi, '');
    return value;
}

module.exports = {
    Query: query
}