'use strict'
/**
 * @namespace file
 */
const fs = require('fs')
const crypto = require('crypto')
const BUFFER_SIZE = 8192

function getFileType (filePath) {
  const buffer = Buffer.alloc(8)
  const fd = fs.openSync(filePath, 'r')
  fs.readSync(fd, buffer, 0, 8, 0)
  const newBuf = buffer.slice(0, 4)
  fs.closeSync(fd)
  const typeCode = newBuf.toString('hex')
  let filetype = 'unknown'
  let mimetype = 'unknown'
  // console.log(typeCode)
  switch (typeCode.substring(0, 4)) {
    case '424d':
      filetype = 'bmp'
      mimetype = 'image/bmp'
      break
    case '504b':
      filetype = 'zip'
      mimetype = ['application/x-zip', 'application/zip', 'application/x-zip-compressed']
      break
  }
  switch (typeCode.substring(0, 6)) {
    case '474946':
      filetype = 'gif'
      mimetype = 'image/gif'
      break
  }
  switch (typeCode) {
    case 'ffd8ffe1': // 带有exif
      filetype = 'jpg'
      mimetype = ['image/jpeg', 'image/pjpeg']
      break
    case 'ffd8ffe0': // 老式相机采用JFIF格式
      filetype = 'jpg'
      mimetype = ['image/jpeg', 'image/pjpeg']
      break
    case '89504e47':
      filetype = 'png'
      mimetype = ['image/png', 'image/x-png']
      break
    case '25504446':
      filetype = 'pdf'
      mimetype = 'application/pdf'
      break
    case '49492a00':
      filetype = 'tif'
      mimetype = 'image/tiff'
      break
    case '4d4d002a':
      filetype = 'tif'
      mimetype = 'image/tiff'
      break
    case '38425053':
      filetype = 'psd'
      mimetype = 'image/vnd.adobe.photoshop'
      break
    default:
      break
  }
  return {
    fileType: filetype,
    mimeType: mimetype
  }
}
function checkImgComplete (filePath, type = 'jpg') {
  const f1 = fs.readFileSync(filePath)
  const pos = f1.slice(-4)
  if (type === 'jpg' || type === 'jpeg') {
    return pos[2] === 255 && pos[3] === 217
  }
  if (type === 'png') {
    return pos[0] === 174 && pos[1] === 66 && pos[2] === 96 && pos[3] === 130
  }
  if (type === 'gif') {
    return pos[2] === 0 && pos[3] === 59
  }
  return -1
}

function getFileMd5 (filename) {
  const fd = fs.openSync(filename, 'r')
  const hash = crypto.createHash('md5')
  const buffer = Buffer.alloc(BUFFER_SIZE)

  try {
    let bytesRead

    do {
      bytesRead = fs.readSync(fd, buffer, 0, BUFFER_SIZE)
      hash.update(buffer.slice(0, bytesRead))
    } while (bytesRead === BUFFER_SIZE)
  } finally {
    fs.closeSync(fd)
  }

  return hash.digest('hex')
}
const csv2Arr = (data, splitStr = ',', omitFirstRow = false, fn = it => it) =>
  data
    .slice(omitFirstRow ? data.indexOf('\n') + 1 : 0)
    .split('\n')
    .map(v => v.split(splitStr).map(v => fn(v)))

function deleteAll (path) {
  /**
   * @memberof file#
   * @param {String} path - 目录路径
   * @description 递归删除目录
   * @return {number}
   * @example
   * $.file.deleteAll('./temp')
   */
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(function (file, index) {
      const curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteAll(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
module.exports = {
  getFileType,
  checkImgComplete,
  getFileMd5,
  csv2Arr,
  deleteAll
}
