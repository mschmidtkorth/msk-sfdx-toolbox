const xml2js = require('xml2js');
const fs = require('fs');

/**
 * Returns the content of specified file
 * @param {String} filePath File's path
 */
function getFileContent(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

/**
 * Read content of an XML file and converts it into a JS object
 * @param {String} filePath Absolute or relative path to a file
 */
function readXmlFileAndConvertToJson(filePath) {
  return new Promise((resolve, reject) => {
    // open xml file
    fs.readFile(filePath, (err, data) => {
      if (err) return reject(err);

      let parser = new xml2js.Parser({
        preserveChildrenOrder: true
      });

      // convert to json
      xml2js.parseString(data, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  });
}

/**
 * Converts the content of a JS object into XML format and writes the
 * result at the specified location in filePath.
 * If file already exists it will be overwritten.
 * @param {Object} jsonData JS object to serialize into XML format
 * @param {String} filePath Absolute or relative path of the destination file
 */
function convertJsonToXmlAndWriteToFile(jsonData, filePath) {
  return new Promise((resolve, reject) => {
    const xmlData = new xml2js.Builder().buildObject(jsonData)
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<'); // xml2js automatically encodes HTML characters - undo this for merge markers, otherwise they are not recognized. Note: The stringify option for the Builder class does not work. https://github.com/Leonidas-from-XIV/node-xml2js/pull/451
    fs.writeFile(filePath, xmlData, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * Extract all file names inside a directory
 * @param {Strin} directoryPath Directory path
 */
function getAllFileNames(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) return reject(err);
      return resolve(files);
    });
  });
}

module.exports = {
  readXmlFileAndConvertToJson,
  convertJsonToXmlAndWriteToFile,
  getAllFileNames,
  getFileContent
};