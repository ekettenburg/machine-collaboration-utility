'use strict';
/* global describe, it */
const should = require(`should`);
const request = require(`request-promise`);
const fs = require(`fs-promise`);
const path = require(`path`);

module.exports = function toDoListTests() {
  let fileUuid;
  let fileArrayLength;

  describe('Files unit test', async function () {
    it('should upload a file and retrieve a file object', async function (done) {
      const testFilePath = path.join(__dirname, `blah.txt`);
      const file = await fs.createReadStream(testFilePath);
      const formData = { file };
      const requestParams = {
        method: `POST`,
        uri: `http://localhost:9000/v1/files`,
        formData,
      };
      const uploadResponse = JSON.parse(await request(requestParams));
      // Check that the returned object is an array with a single file object
      // The file object should have a uuid and a name
      should(uploadResponse.length).equal(1);
      should(!!uploadResponse.uuid);
      should(!!uploadResponse.name);
      done();
    });

    it('should retrieve a dictionary of files', async function (done) {
      const requestParams = {
        method: `GET`,
        uri: `http://localhost:9000/v1/files`,
        json: true,
      };
      const res = await request(requestParams);
      should(res.constructor).equal(Object);
      fileArrayLength = Object.keys(res).length;
      fileUuid = res[Object.keys(res)[0]].uuid;
      done();
    });

    it('should retrieve an a single file', async function (done) {
      const requestParams = {
        method: `GET`,
        uri: `http://localhost:9000/v1/files/${fileUuid}`,
        json: true,
      };
      const res = await request(requestParams);
      should(res.uuid).equal(fileUuid);
      done();
    });

    it('should fail when trying to retrieve a nonexistent file', async function (done) {
      try {
        const requestParams = {
          method: `GET`,
          uri: `http://localhost:9000/v1/files/${fileUuid}foobar`,
          json: true,
        };
        const res = await request(requestParams);
        // This should never get to here. The request should fail
        should(res).equal(false);
        done();
      } catch (ex) {
        should(ex.statusCode).equal(404);
        done();
      }
    });


    it('should delete the file that was originally uploaded', async function (done) {
      const requestParams = {
        method: `DELETE`,
        uri: `http://localhost:9000/v1/files/`,
        body: {
          uuid: fileUuid,
        },
        json: true,
      };
      const res = await request(requestParams);
      should(res.status).equal(`File deleted`);
      done();
    });

    it('should have one less file in the file array after deleting a file', async function (done) {
      const requestParams = {
        method: `GET`,
        uri: `http://localhost:9000/v1/files`,
        json: true,
      };
      const res = await request(requestParams);
      should(res.constructor).equal(Object);
      const newFileArrayLength = Object.keys(res).length;
      should(newFileArrayLength).equal(fileArrayLength - 1);
      done();
    });
  });
};
