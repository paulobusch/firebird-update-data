const fs = require('fs');

class Storage {
    constructor(fileName) {
        this.fileName = fileName;
    }

    get(jsonObjDefault) {
        const exists = fs.existsSync(this.fileName);
        if (!exists) return jsonObjDefault;
        const jsonStr = fs.readFileSync(this.fileName, 'utf8');
        return JSON.parse(jsonStr);
    }

    set(jsonObj) {
        fs.writeFileSync(this.fileName, JSON.stringify(jsonObj));
    }
}

module.exports = {
    Storage
}