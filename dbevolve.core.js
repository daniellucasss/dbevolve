const pg = require('pg');
const log4js = require('log4js');
const logger = log4js.getLogger('dbevolve');
const encrypter = require('./encrypter');
let currentLogs = [];
let newLogs = [];

const db = {
    evolve: (dbevolveConfig) => {
        logger.debug('DBEvolve started!');
        const client = new pg.Client(dbevolveConfig.url);
        client.connect((err) => {
            if (err) {
                throw err;
            }
            logger.debug('Connected successsfully!');
            let query = client.query('CREATE TABLE IF NOT EXISTS DB_EVOLVE_LOGS(ID SERIAL PRIMARY KEY,' +
            ' AUTHOR TEXT NOT NULL, HASHLOG TEXT NOT NULL, DATE_LOG TIMESTAMP NOT NULL);');
            query.then(() => {
                runDbevolve(dbevolveConfig, client);
            }).catch(err => {
                logger.error(err.message);
                endConnection(client);
            });
        });
    }    
}

function runDbevolve(dbevolveConfig, client) {
    let counter = 0;
    let query = client.query({text: 'SELECT HASHLOG FROM DB_EVOLVE_LOGS', values: {}});
    query.then((result) => {
        currentLogs = result.rows.map((arr) => {return arr.hashlog;});
        return runQuery(client, dbevolveConfig, counter);
    }).catch(err => {
        logger.error(err.message);
        endConnection(client);
    });
}

function runQuery(client, dbevolveConfig, counter) {
    if(dbevolveConfig.scripts[counter] && 
        alreadyExists(dbevolveConfig.scripts[counter])) {
        return runQuery(client, dbevolveConfig, counter + 1);
    } else if (!dbevolveConfig.scripts[counter]) {
        return finish(client);
    }
    let query = client.query(dbevolveConfig.scripts[counter].script);
    query.then((result) => {
        addNewLog(dbevolveConfig.scripts[counter]);
        counter++;
        if(dbevolveConfig.scripts[counter]) {
            return runQuery(client, dbevolveConfig, counter);
        }
        finish(client);
    }).catch(err => {
        logger.error(err.message);
        endConnection(client);
    });
}

function alreadyExists(scriptObj) {
    if(currentLogs.indexOf(encrypter(scriptObj.script)) != -1
        || newLogs.indexOf(encrypter(scriptObj.script)) != -1) {
        logger.debug('The script ' + scriptObj.script + ' already exists!');
        return true;
    }
    return false;
}

function addNewLog(scriptObj) {
    newLogs.push({author: scriptObj.author, hashLog: encrypter(scriptObj.script)});
}

function finish(client) {
    if(newLogs.length === 0) {
        return endConnection(client);
    }
    return saveNewLog(client);
}

function endConnection(client) {
    client.end(function (err) {
        if (err) {
            logger.error(err.message);
            throw err;
        } 
        logger.debug('Ending conection!');
    });
}

function saveNewLog(client) {
    let query = client.query(returnInsertLogs());
    query.then((result) => {
        return endConnection(client);
    }).catch(err => {
        logger.error(err.message);
        endConnection(client);
        return;
    }); 
}

function returnInsertLogs() {
    let insertLog = 'INSERT INTO DB_EVOLVE_LOGS(AUTHOR, HASHLOG, DATE_LOG) VALUES ';
    for(let cont = 0; cont < newLogs.length; cont++) {
        insertLog += "('" + newLogs[cont].author + "' , '" + newLogs[cont].hashLog + "', CURRENT_TIMESTAMP),";
    }
    return insertLog.substring(0, insertLog.length - 1);
}

module.exports = db;