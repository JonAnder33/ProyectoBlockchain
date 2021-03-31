'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
const config = require('../../../config');
let compra;
let dato;
let bloquee;
class CryptoBlock{
    constructor(index, timestamp, data, precedingHash=" "){
     this.index = index;
     this.timestamp = timestamp;
     this.data = data;
     this.precedingHash = precedingHash;
     this.hash = this.computeHash();     
    }
    computeHash(){
        return "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7";
    }
}
//crea un block
exports.creaBlock = async function (index, timestamp, data, precedingHash) {
    try{
        bloquee = new CryptoBlock(index, timestamp, data, precedingHash);
    }
    catch (err) {
        next(err);
      }
};
class CryptoBlockchain{
    constructor(){
        this.blockchain = [this.startGenesisBlock()];     
    }
    startGenesisBlock(){
        return new CryptoBlock(0, "01/01/2020", "Initial Block in the Chain", "0");
    }
    
    
    addNewBlock(newBlock){
        newBlock.precedingHash = this.obtainLatestBlock().hash;
        newBlock.hash = newBlock.computeHash();        
        this.blockchain.push(newBlock);
    }
}
exports.obtainLatestBlock = async function (){
    try{
        dato=0;
    dato = compra.blockchain[compra.blockchain.length - 1];}
    catch (err) {
        next(err);
      }
}
exports.creaBlockchain = async function () {
    try{ compra = new CryptoBlockchain();}
    catch (err) {
        next(err);
      }
   
};
/*
var createGenesisBlock = (datos) => {
    print("esta shit funciona");
    return new Block(0, "0", new Date().getTime(), datos, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
    
};

var generateNextBlock = (last_block) => {
    this.index=last_block.index +1;
    this.timestamp= new Date().getTime();
    this.data= "Soy un bloque" + String(this.index);
    hashCode = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    if (last_block.hash="816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7") {
        this.hash="b7154836da6afc367695e6337db8a921823784c14378abed4f7d7816534932c2";
    }
    if (last_block.hash="b7154836da6afc367695e6337db8a921823784c14378abed4f7d7816534932c2") {
        this.hash="6afc367695e6337b7154836dadb8a921823784c14378abed4f7d7816534932c2";
    }
    print("esta shit funciona");
    return new Block(this.index, last_block.hash, this.timestamp, this.data, this.hash);
};*/

