var chai = require('chai'),
    should = chai.should,
    expect = chai.expect,
    Promise = require('bluebird'),
    request = require('superagent-promise')(require('superagent'), Promise),
    chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var url = process.env.URL || 'http://localhost:8000/todos';


describe('Cross Origin Requests', function() {
    var result;

    before(function() {
        result = request('OPTIONS', url)
            .set('Origin', 'http://someplace.com')
            .end();
    });

    it('should return the correct CORS headers', function() {
        return assert(result, 'header').to.contain.all.keys([
            'access-control-allow-origin',
            'access-control-allow-methods',
            'access-control-allow-headers',
        ]);
    });

    it('should allow all origins', function() {
        return assert(result, "header.access-control-allow-origin").to.equal('*');
    })
});


describe('Create Todo Item', function() {
    var result;
    before(function() {
        result = post(url, {
            title: 'Walk the dog'
        });
    });

    it('should return a 201 CREATED response', function() {
        return assert(result, 'status').to.equal(201);
    });

    it('should receive a location hyperlink', function() {
        return assert(result, 'header.location').to.match(/^https?:\/\/.+\/todos\/[\d]+$/);
    });
    it('should create the item', function() {
        var item = result.then(function(res) {
            return get(res.header['location']);
        });
        return assert(item, 'body.title').that.equals('Walk the dog');
    })
    after(function() {
        return del(url);
    });
});


function post(url, data) {
    return request.post(url)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(data)
        .end();
}

function get(url) {
    return request.get(url)
        .set('Accept', 'application/json')
        .end();
}

function del(url) {
    return request.del(url).end();
}

function update(url, method, data) {
    return request(method, url)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(data)
        .end();
}


function assert(result, prop) {
    return expect(result).to.eventually.have.deep.property(prop);
}
