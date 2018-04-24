const axios = require('axios');
const queryString = require('query-string');
const crypto = require('crypto');

/*
    API credentials are stored outside of the main class
    because ES6 does not support private properties and
    we do not want to make it too easy to hack the API secret
*/
const _apiKey = new WeakMap();
const _apiSecret = new WeakMap();


function required() {
    throw new Error('Missing parameter');
}

class Ostkit {
    constructor(apiKey = required(), apiSecret = required(), apiEndpoint = 'https://playgroundapi.ost.com/') {
        _apiKey.set(this, apiKey);
        _apiSecret.set(this, apiSecret);
        this.fetcher = axios.create({
            baseURL: apiEndpoint
        }) 
    }

    _sign(stringToSign) {
        var buff = new Buffer.from(_apiSecret.get(this), 'utf8');
        var hmac = crypto.createHmac('sha256', buff);
        hmac.update(stringToSign);
        return hmac.digest('hex');
    }

    _generateQuery(inputParams) {
        inputParams["api_key"] = _apiKey.get(this);
        inputParams["request_timestamp"] = Math.round((new Date()).getTime() / 1000);
        const queryParamsString = queryString.stringify(inputParams, {arrayFormat: 'bracket'}).replace(/%20/g, '+');
        return queryParamsString;
    }
    
    async _postQuery(endpoint, data) {
        var queryData = this._generateQuery(data);
        var query = endpoint + '?' + queryData;
        const signature = this._sign(query);
        query = query+"&signature="+signature;
        queryData = queryData+"&signature="+signature;

        let result = await this.fetcher(endpoint, {method:"POST", data: queryData});

        if (!result.data.success) throw new Error(result.data.err);
        return result.data.data;
    }

    async _getQuery(endpoint, data) {
        var queryData = this._generateQuery(data);
        var query=endpoint + '?' + queryData;
        const signature = this._sign(query);
        query = query+"&signature="+signature;

        let result = await this.fetcher(query, {method:"GET"});

        if (!result.data.success) throw new Error(result.data.err);
        return result.data.data;
    }

    async usersCreate({name}) {
        return await this._postQuery("/users/create", {name})
    }

    async usersEdit({uuid, name}) {
        return await this._postQuery("/users/edit", {uuid, name})
    }
    
    async usersList({page_no = 1, filter = "all", order_by = "creation_time", order="desc"} = {}) {
        return await this._getQuery("/users/list", {page_no, filter, order_by, order})
    }

    async usersAirdropDrop({amount, list_type}) {
        return await this._postQuery("/users/airdrop/drop", {amount, list_type})
    }
    async usersAirdropStatus({airdrop_uuid}) {
        return await this._getQuery("/users/airdrop/status", {airdrop_uuid})
    }

    async transactiontypesCreate({name, kind, currency_type, currency_value, commission_percent}) {
        return await this._postQuery("/transaction-types/create", {name, kind, currency_type, currency_value, commission_percent})
    }
    async transactiontypesEdit({client_transaction_id, name, kind, currency_type, currency_value, commission_percent}) {
        return await this._postQuery("/transaction-types/edit", {client_transaction_id, name, kind, currency_type, currency_value, commission_percent})
    }
    async transactiontypesList() {
        return await this._getQuery("/transaction-types/list", {})
    }
    async transactiontypesExecute({from_uuid, to_uuid, transaction_kind}) {
        return await this._postQuery("/transaction-types/execute", {from_uuid, to_uuid, transaction_kind})
    }
    async transactiontypesStatus({transaction_uuids = []}) {
        return await this._postQuery("/transaction-types/status", {transaction_uuids})
    }
}

module.exports = Ostkit