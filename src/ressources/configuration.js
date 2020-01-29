export function JSON_wellknown(scheme, hostname, routerBaseName = '') {
  try {
    const respJSON = JSON.stringify({
      "report-configuration": `${scheme}://${hostname}${routerBaseName}/.well-known/kheops-report-configuration`,
      jwks_uri: `${scheme}://${hostname}${routerBaseName}/certs`
    });
    return respJSON;
  } catch (e) {
    throw e;
  }
}

export function JSON_kheopsConfiguration(scheme = "http", hostname, routerBaseName = '') {
  try {
    const respJSON = JSON.stringify({
      jwks_uri: `${scheme}://${hostname}${routerBaseName}/certs`,
      response_type: "code",
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "RS256",
      redirect_uri: `${scheme}://${hostname}${routerBaseName}/report.html`,
      client_name: "Kheops Report Provider",
      client_uri: "https://kheops.online",
      contacts: ["contact@kheops.online"]
    });
    return respJSON;
  } catch (e) {
    throw e;
  }
}

export function JSON_openidConfiguration(scheme = "http", hostname, routerBaseName = '') {
  try {
    const respJSON = JSON.stringify({
      issuer: `${scheme}://${hostname}`,
      authorization_endpoint: `${scheme}://${hostname}${routerBaseName}/authorization`,
      token_endpoint: `${scheme}://${hostname}${routerBaseName}/token`
    });
    return respJSON;
  } catch (e) {
    throw e;
  }
}

export function JSON_cert(jwk) {
  try {
    const respJSON = JSON.stringify({
      keys: [
        {
          n: jwk["n"],
          e: jwk["e"],
          kid: "0",
          kty: jwk["kty"],
          alg: "RS256",
          use: "sig"
        }
      ]
    });
    return respJSON;
  } catch (e) {
    throw e;
  }
}
