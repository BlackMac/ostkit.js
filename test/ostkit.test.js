const Ostkit = require('../index');
const assert = require('assert');
const should = require('should');

describe('ostkit', function() {
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

  describe('usersList()', function(done) {
    it('it should send a request to /users/list', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data){
            data.should.startWith("/users/list?api_key=apikey&filter=all&order=desc&order_by=creation_time&page_no=1&request_timestamp=")
            return {"data":{"success":true, "data":null}}
        });
        ok.usersList().then(function() { done() }, done);
    });
    it('it should return the data.data property on success', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data){
            return {"data":{"success":true, "data":"SUCCESS"}};
        });
        ok.usersList().then((res) => {
            res.should.equal("SUCCESS");
            return done();
        });
    });
    it('it should throw when success is false', function(done) {
        var ok = new Ostkit("apikey", "apisecret", "http://www.demo.com");
        ok.fetcher=(function(data){
            return {"data":{"success":false, "err":"NOPE"}};
        });
        ok.usersList().then((res) => {
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
