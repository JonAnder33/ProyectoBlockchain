'use strict';
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

//Calcula el hash, aunque he de decir que debido a no poder implementar las librerias que contienen el metodo SHA256 metodo que es para calcular
//el hash pues he tenido que improvisar con esto (que es un random basico), ya que no me dejaba implementarla ni usar ninguna libreria externa
exports.computeHash= async function(){
    let hashcalculado=0;
    for (let index = 0; index < 3; index++) {
        hashcalculado=hashcalculado+ (Math.floor(Math.random() * (10 - 0)) + 0)*10^index;
        
    }
    

    return hashcalculado.toString();
}
//crea una cadena de bloques de 4 (se pueden añadir mas) y regresa el hash de el ultimo bloque de la cadena
exports.creaBlock = async function (index, timestamp, data, precedingHash) {
        new CryptoBlock(index, timestamp, data, precedingHash);
        new CryptoBlock(index+1, timestamp, "", await indy.blockchain.obtenerBlockHash(index,timestamp,data,precedingHash));
        new CryptoBlock(index+2, timestamp, "", await indy.blockchain.obtenerBlockHash(index+1,timestamp,data,await indy.blockchain.obtenerBlockHash(index,timestamp,data,precedingHash)));
        let contraseña = await indy.blockchain.obtenerBlockHash(index+2, timestamp, "", await indy.blockchain.obtenerBlockHash(index+1,timestamp,data,await indy.blockchain.obtenerBlockHash(index,timestamp,data,precedingHash)));
        new CryptoBlock(index+3, timestamp, "", contraseña);
        return contraseña;
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



