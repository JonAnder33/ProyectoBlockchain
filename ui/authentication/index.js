//Se encarga del inicio de sesión

'use strict';

exports.validTokens = [];

exports.isLoggedIn = function(req, res, next) {
    if (exports.validTokens.includes(req.session.token))
        return next();
    else
        res.redirect('/login');
};
