const Ostkit = require('../index');
const assert = require('assert');
const should = require('should');

describe('ostkit internal', function() {
  describe('constructor()', function() {
    it('it should throw when no params are given', function() {
        (function() {
            new Ostkit()
        }).should.throw()
    });
    it('it should throw when no apiSecret is given', function() {
        (function() {
            new Ostkit("apikey")
        }).should.throw()
    });
    it('it should set up a fetcher with the correct baseURL', function() {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher.defaults.baseURL.should.equal("http://www.demo.com");
    });
  });

  describe('_sign()', function() {
    it('it should sign any string with the API Secret', function() {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok._sign("test").should.equal("b015f92c22cfcc8fd6adb0fc54b210cf54a9f1526f3a4ccee5113650336032f8");
        var ok = new Ostkit("apikey", "anothersecret", "http://www.demo.com");
        ok._sign("test").should.equal("a8bf870cff7b9c635bf4fdce9dc911d249216b46bb55e53039e47fc1f15d3804");
    });
  })

  describe('_generateQuery()', function() {
    it('it should return a string starting with the endpoint', function() {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        var query = ok._generateQuery({});
        query.should.startWith("api_key=apikey");
    });
  })

  describe('_getQuery()', function() {
    it('it should send the data in the url', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data){
            data.should.startWith("/my/endpoint?");
            data.should.match(/\&test=test/);
            return {"data":{"success":true, "data":null}}
        });
        ok._getQuery("/my/endpoint", {test: "test"}).then(function() { done() }, done);
    });
    it('it should return the data.data property on success', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data){
            return {"data":{"success":true, "data":"SUCCESS"}};
        });
        ok._getQuery("/my/endpoint", {test: "test"}).then((res) => {
            res.should.equal("SUCCESS");
            return done();
        });
    });
    it('it should throw when success is false', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data){
            return {"data":{"success":false, "err":"NOPE"}};
        });
        ok._getQuery("/my/endpoint", {test: "test"}).then((res) => {
            try {
                res.should.equal("SUCCESS");
                return done();
            } catch(e) {
                return done(e);
            }
        }).catch((e) => {
            e.should.be.an.instanceOf(Error)
            return done()
        });
    });
  })

  describe('_postQuery()', function() {
    it('it should not send the data in the url', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data){
            data.should.equal("/my/endpoint")
            return {"data":{"success":true, "data":null}}
        });
        ok._postQuery("/my/endpoint", {test: "test"}).then(function() { done() }, done);
    });
    it('it should send the data in the body', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data, config){
            config.data.should.match(/\&test=test/)
            return {"data":{"success":true, "data":null}}
        });
        ok._postQuery("/my/endpoint", {test: "test"}).then(function() { done() }, done);
    });
    it('it should return the data.data property on success', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data){
            return {"data":{"success":true, "data":"SUCCESS"}};
        });
        ok._postQuery("/my/endpoint", {test: "test"}).then((res) => {
            res.should.equal("SUCCESS");
            return done();
        });
    });
    it('it should throw when success is false', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data){
            return {"data":{"success":false, "err":"NOPE"}};
        });
        ok._postQuery("/my/endpoint", {test: "test"}).then((res) => {
            try {
                res.should.equal("SUCCESS");
                return done();
            } catch(e) {
                return done(e);
            }
        }).catch((e) => {
            e.should.be.an.instanceOf(Error)
            return done()
        });
    });
  })
});

const calls=[
    {name:"usersCreate", path:"/users/create", method:"GET", fields:["name"]},
    {name:"usersEdit", path:"/users/edit", method:"POST", fields:["uuid","name"]}
    // "usersList":{name:"usersList", method:"GET", fields:["page_no","filter", "order_by", "order"]},
    // "usersAirdropDrop":{name:"usersAirdropDrop", method:"POST", fields:["amount", "list_type"]},
    // "usersAirdropStatus":{name:"usersAirdropStatus", method:"GET", fields:["airdrop_uuid"]},
    // "transactiontypesCreate":{name:"transactiontypesCreate", method:"POST", fields:["name", "kind", "currency_type", "currency_value", "commission_percent"]},
    // "transactiontypesEdit":{name:"transactiontypesEdit", method:"POST", fields:["client_transaction_id", "name", "kind", "currency_type", "currency_value", "commission_percent"]},
    // "transactiontypesList":{name:"transactiontypesList", method:"GET", fields:[]},
    // "transactiontypesExecute":{name:"transactiontypesExecute", method:"POST", fields:["from_uuid", "to_uuid", "transaction_kind"]},
    // "transactiontypesStatus":{name:"transactiontypesStatus", method:"GET", fields:["transaction_uuids"]}
]
describe('ostkit API Calls', function() {
    calls.forEach(element => {
        describe(element.name+"()", function(done) {
            it("it should send a get request to "+element.path, function(done) {
                var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
                ok.fetcher=(function(data, config){
                    data.should.startWith(element.path)
                    config.method.should.equal(element.method)
                    return {"data":{"success":true, "data":null}}
                });
                var n = element.name;
                console.log(element)
                ok[n]().then(function() { done() }, done);
            });
        })
    });
  describe('usersList()', function(done) {
    it('it should send a get request to /users/list', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data, config){
            data.should.startWith("/users/list?api_key=apikey&filter=all&order=desc&order_by=creation_time&page_no=1&request_timestamp=")
            config.method.should.equal("GET")
            return {"data":{"success":true, "data":null}}
        });
        ok.usersList().then(function() { done() }, done);
    });
  })

  describe('usersCreate()', function(done) {
    it('it should send a post request to /users/create', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data, config){
            data.should.startWith("/users/create")
            config.method.should.equal("POST")
            return {"data":{"success":true, "data":null}}
        });
        ok.usersCreate({name:"demouser"}).then(function() { done() }, done);
    });
  })

  describe('usersEdit()', function(done) {
    it('it should send a post request to /users/edit', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data, config){
            data.should.startWith("/users/edit")
            config.method.should.equal("POST")
            return {"data":{"success":true, "data":null}}
        });
        ok.usersEdit({uuid:"uu-id", name:"demouser"}).then(function() { done() }, done);
    });
  })

  describe('usersAirdropDrop()', function(done) {
    it('it should send a post request to /users/airdrop/drop', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data, config){
            data.should.startWith("/users/airdrop/drop")
            config.method.should.equal("POST")
            return {"data":{"success":true, "data":null}}
        });
        ok.usersAirdropDrop({amount:1, list_type:"demo"}).then(function() { done() }, done);
    });
  })

  describe('usersAirdropStatus()', function(done) {
    it('it should send a post request to /users/airdrop/status', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data, config){
            data.should.startWith("/users/airdrop/status")
            config.method.should.equal("GET")
            return {"data":{"success":true, "data":null}}
        });
        ok.usersAirdropStatus({airdrop_uuid:"uu-id"}).then(function() { done() }, done);
    });
  })
});
