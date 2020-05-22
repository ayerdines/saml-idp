//shorthands claims namespaces
var fm = {
    'nameIdentifier': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
    'givenname': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
    'surname': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
};

/**
 * Claim Types:
 * http://msdn.microsoft.com/en-us/library/microsoft.identitymodel.claims.claimtypes_members.aspx
 *
 * @param  {Object} user passed by getUserFromRequest method in app.js
 */
function ProfileMapper (pu) {
    if(!(this instanceof ProfileMapper)) {
        return new ProfileMapper(pu);
    }
    this._pu = pu;
}

/**
 *
 * @return {Object}    WsFederation claim identity
 */
ProfileMapper.prototype.getClaims = function () {
    var claims = {};

    claims[fm.nameIdentifier]  = this._pu.email;
    claims[fm.givenname]  = this._pu.given_name;
    claims[fm.surname]    = this._pu.family_name;

    var dontRemapAttributes = ['emails', 'displayName', 'name', 'id', '_json'];

    Object.keys(this._pu).filter(function (k) {
        return !~dontRemapAttributes.indexOf(k);
    })

    return claims;
};

/**
 * returns the nameidentifier for the saml token.
 *
 * @return {Object} object containing a nameIdentifier property and optional nameIdentifierFormat.
 */
ProfileMapper.prototype.getNameIdentifier = function () {
    var claims = this.getClaims();

    return {
        nameIdentifier: claims[fm.nameIdentifier]
    };

};

/**
 * claims metadata used in the metadata endpoint.
 *
 * @return {[type]}    WsFederation claim identity
 */
ProfileMapper.prototype.metadata = [ {
    id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
    optional: true,
    displayName: 'Given Name',
    description: 'The given name of the user'
},{
    id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
    optional: true,
    displayName: 'Surname',
    description: 'The surname of the user'
}, {
    id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    optional: true,
    displayName: 'Name ID',
    description: 'The SAML name identifier of the user'
}];

module.exports = ProfileMapper;
