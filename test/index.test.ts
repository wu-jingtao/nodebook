import expect = require('expect.js');

describe('测试模块', function () {

    before(function () {
        // 所有测试开始之前执行
    });

    after(function () {
        // 所有测试结束之后执行
    });

    beforeEach(function () {
        // 每个测试开始之前执行
    });

    afterEach(function () {
        // 每个测试结束之后执行
    });

    it('测试单元', function () {
        expect('something').to.be.a('string');
    });
});