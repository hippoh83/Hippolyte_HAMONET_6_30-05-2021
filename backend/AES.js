require('dotenv').config();
const CryptoJS = require("crypto-js");

const key = CryptoJS.enc.Hex.parse(process.env.cryptoJSkey);
const iv = CryptoJS.enc.Hex.parse(process.env.cryptoJSiv);

exports.encrypt = (field) => {

  return CryptoJS.AES.encrypt(field, key, { iv: iv }).toString();
}

exports.decrypt = (ciphertext) => {
  
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, { iv: iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}