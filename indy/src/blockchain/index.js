const sdk = require('indy-sdk');
const indy = require('../../index.js');
const config = require('../../../config');

//Clase bloque
class CryptoBlock{
    constructor(index, timestamp, data, precedingHash){
     this._index = index;
     this._timestamp = timestamp;
     this._data = data;
     this._precedingHash = precedingHash;
     this._hash = this.computeHash;     
    }
    get index(){
        return this._index;
    }
    get timestamp(){
        return this._timestamp;
    }
    get data(){
        return this._data;
    }
    get precedingHash(){
        return this._precedingHash;
    }
    
}

/**
 * Clase Blockchain
 */
class Blockchain{
    constructor() {
    this.chain = [this.createGenesis()];
    } 

    createGenesis(){
        return new Block(0, "99/99/9999", "Genesis block", "0")
        }
    latestBlock() {
        return this.chain[this.chain.length - 1]
         }  
         

}

//Funcion que agregara un bloque a un blockchain
exports.addBlock= async function(blockchain,newBlock){
    newBlock.previousHash = blockchain.latestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    blockchain.chain.push(newBlock);
    return 0;
    }

//Calcula el hash, aunque he de decir que debido a no poder implementar las librerias que contienen el metodo SHA256 metodo que es para calcular
//el hash pues he tenido que improvisar con esto (que es un random basico), ya que no me dejaba implementarla ni usar ninguna libreria externa
exports.computeHash= async function(){
    let hashcalculado=0;
    for (let index = 0; index < 10; index++) {
        hashcalculado=40333333333330000;//hashcalculado+ (Math.floor(Math.random() * (10 - 0)) + 0)*10^index;
        
    }
    

    return hashcalculado.toString();
}
//crea un bloque (se pueden añadir mas) y regresa el hash del bloque 
exports.creaBlock = async function (index, timestamp, data, precedingHash) {
        bloque= new CryptoBlock(index, timestamp, data, precedingHash);
        return bloque;
};

//Funcion que devuelve el hash, aunque he de decir que debido a no poder implementar las librerias que contienen el metodo SHA256 metodo que es para calcular
//el hash pues he tenido que improvisar con esto, ya que no me dejaba implementarla ni usar ninguna libreria externa
exports.obtenerBlockHash = async function (index, timestamp, data, precedingHash) {
    let hashcalculado=0;
    for (let index = 0; index < 3; index++) {
        hashcalculado=hashcalculado+ (Math.floor(Math.random() * (10 - 0)) + 0)*10^index;
        
    }

    return hashcalculado.toString();

};
//crea un blockchain
exports.crearBlockchain = async function(){
    blockchain = new Blockchain;
    return blockchain;
};

