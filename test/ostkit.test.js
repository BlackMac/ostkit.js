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
    {name:"usersCreate", path:"/users/create", method:"POST", fields:{"name":"test"}},
    {name:"usersEdit", path:"/users/edit", method:"POST", fields:{"uuid":"test","name":"test"}},
    {name:"usersList", path:"/users/list", method:"GET", fields:{"page_no":"test","filter":"test", "order_by":"test", "order":"test"}},
    {name:"usersAirdropDrop", path:"/users/airdrop/drop", method:"POST", fields:{"amount":"test", "list_type":"test"}},
    {name:"usersAirdropStatus", path:"/users/airdrop/status", method:"GET", fields:{"airdrop_uuid":"test"}},
    {name:"transactiontypesCreate", path:"/transaction-types/create", method:"POST", fields:{"name":"test", "kind":"test", "currency_type":"test", "currency_value":"test", "commission_percent":"test"}},
    {name:"transactiontypesEdit", path:"/transaction-types/edit", method:"POST", fields:{"client_transaction_id":"test", "name":"test", "kind":"test", "currency_type":"test", "currency_value":"test", "commission_percent":"test"}},
    {name:"transactiontypesList", path:"/transaction-types/list", method:"GET", fields:{}},
    {name:"transactiontypesExecute", path:"/transaction-types/execute", method:"POST", fields:{"from_uuid":"test", "to_uuid":"test", "transaction_kind":"test"}},
    {name:"transactiontypesStatus", path:"/transaction-types/status", method:"POST", fields:{"transaction_uuids":"test"}}
]
describe('ostkit API Calls', function() {
    var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
    beforeEach(function(done) {
        ok.fetcher=null;
        done()
    });
    calls.forEach(element => {
        describe(element.name+"()", function(done) {
            it("it should send a "+element.method+" request to "+element.path, function(done) {
                ok.fetcher=(function(data, config){
                    data.should.startWith(element.path)
                    config.method.should.equal(element.method)
                    return {"data":{"success":true, "data":null}}
                });
                var n = element.name;
                ok[n](element.fields).then(function() { done() }, done);
            });
        })
    });
  });
