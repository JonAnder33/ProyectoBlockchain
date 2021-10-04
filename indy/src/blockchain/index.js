const sdk = require('indy-sdk');
const indy = require('../../index.js');
const config = require('../../../config');
const crypto = require("crypto");
let patata;
let blockChain;
let numero=0;
//crea un blockchain
exports.crearpatata = async function(){
    if(!patata) {
        patata = "Hola";
        console.log(patata);
    }
    
    return patata;  
  
        
 
 
};
 
/**
 * Clase Blockchain
 */
 class Blockchain{
    constructor(block) {
     this._chain = [block];
 
    } 
    get chain(){
        return this._chain;
    }
 
}
//Clase bloque
 class CryptoBlock{
    constructor(index, timestamp, data, precedingHash, hash){
     this._index = index;
     this._timestamp = timestamp;
     this._data = data;
     this._precedingHash = precedingHash;
     this._hash = hash;     
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
    get hash(){
        return this._hash;
    }
    
}
 
//FUNCIONA
exports.createGenesis= async function(){
    let cripto=  new CryptoBlock(0, "99/99/9999", "Genesis block", "0", crypto
    .createHash("sha256")
    .update(0 + "0" + "99/99/9999" + "Genesis block" + 0)
    .digest("hex"));
    console.log("Creado el cryptoblog");
    console.log(cripto);
    console.log("----------------");
 
    return cripto;
    }
 
 
 
exports.latestBlock= async function(blockchain) {
    console.log("El hash del ultimo bloque de la cadena del blockchain es:")
    console.log(blockchain._chain[blockchain._chain.length - 1]);
    let  last = blockchain._chain[blockchain._chain.length - 1];
    let hashlast= crypto
            .createHash("sha256")
            .update(last._index + last._precedingHash + last._timestamp + last._data + 0)
            .digest("hex");
    return hashlast;
     }  
 
//FUNCIONA
exports.crearBlockchain = async function(block){
    try {
    let nombre= new Blockchain(block);
    console.log("la longitud de la cadena del blockchain es: "+nombre._chain.length);
    console.log("---------------------------");
 
    
    return nombre;
} catch (error) {
        
}
}
 
 
//Funcion que agregara un bloque a un blockchain
exports.addBlock= async function(blockchain,newBlock){
    try {
        
        blockchain._chain.push(newBlock);
        
        console.log("-----------------------------");
        console.log(blockchain);
 
 
 
        return 0;
    } catch (error) {
        
    }
 
    }
 
//Calcula el hash, aunque he de decir que debido a no poder implementar las librerias que contienen el metodo SHA256 metodo que es para calcular
//el hash pues he tenido que improvisar con esto (que es un random basico), ya que no me dejaba implementarla ni usar ninguna libreria externa
exports.computeHash= async function(bloque){
    console.log("hash creado");
 
    let hashcal = crypto
    .createHash("sha256")
    .update(bloque._index + bloque._precedingHash + bloque._timestamp + bloque._data + 0)
    .digest("hex");
    console.log(hashcal);
    return hashcal;
}
 
 
//FUNCIONA
//crea un bloque Y regresa el bloque 
exports.creaBlock = async function (index, timestamp, data, precedingHash) {
    try {
        
        let bloque= new CryptoBlock(index, timestamp, data, precedingHash,crypto
            .createHash("sha256")
            .update(index + precedingHash + timestamp + data + 0)
            .digest("hex"));
        console.log("Bloque creado");
        console.log(bloque);
        console.log("--------------------------");
        return bloque;  
    } catch (error) {
        
    }
       
};
 
//Funcion que devuelve el hash, aunque he de decir que debido a no poder implementar las librerias que contienen el metodo SHA256 metodo que es para calcular
//el hash pues he tenido que improvisar con esto, ya que no me dejaba implementarla ni usar ninguna libreria externa
exports.obtenerBlockHash = async function (index, timestamp, data, precedingHash) {
    let hashcal = crypto
    .createHash("sha256")
    .update(index + precedingHash + timestamp + data + 0)
    .digest("hex");
    console.log(hashcal);
    return hashcal;
 
};
