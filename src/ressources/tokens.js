var axios = require("axios");
var jwt = require("jsonwebtoken");

export function getAuthenticationJWT(
  configuration,
  privKey,
  clientID,
  jwkID,
  accessCode,
  redirect_uri
) {
  console.log(redirect_uri)

  const token_endpoint = configuration.token_endpoint;
  let signedToken = "";
  try {
    signedToken = signToken(
      privKey,
      clientID,
      token_endpoint,
      120,
      jwkID
    );
  } catch (err) {
    throw err;
  }
  const requestBody = {
    grant_type: "authorization_code",
    client_id: clientID,
    code: accessCode,
    redirect_uri: encodeURIComponent(redirect_uri),
    client_assertion_type:
      "urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer",
    client_assertion: signedToken
  };

  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };
  return axios.post(token_endpoint, urlencoded(requestBody), config);
}

function signToken(privKey, clientID, audience, exp, jwkID) {
  var optionsJWT = {
    algorithm: "RS256",
    issuer: clientID,
    subject: clientID,
    audience: audience,
    jwtid: jwkID.toString(),
    keyid: "0",
    expiresIn: 120
  };
  try {
    return jwt.sign({}, privKey, optionsJWT);
  } catch (err) {
    throw err;
  }
}

function urlencoded(requestBody) {
  let bodyParams = [];
  Object.entries(requestBody).forEach(function(param) {
    if (param[1] !== "") bodyParams.push(param.join("="));
  });
  return bodyParams.join("&");
}
