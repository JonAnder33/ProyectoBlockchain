'use strict';

//Esta función paraliza el programa durante los milisegundos indicados.

exports.sleep = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms)
    })
};



exports.pathToIndyClientHome = function () {
    return require('os').homedir() + "/.indy_client"
}
