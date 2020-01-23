export function JSON_wellknown(scheme, host, port = "80") {
  port = port === "80" || port === "443" ? "" : ":" + port;
  try {
    const respJSON = JSON.stringify({
      "report-configuration": `${scheme}://${host}${port}/.well-known/kheops-report-configuration`,
      jwks_uri: `${scheme}://${host}${port}/certs`
    });
    return respJSON;
  } catch (e) {
    throw e;
  }
}

export function JSON_kheopsConfiguration(scheme = "http", host, port = "80") {
  port = port === "80" || port === "443" ? "" : ":" + port;
  try {
    const respJSON = JSON.stringify({
      jwks_uri: `${scheme}://${host}${port}/certs`,
      response_type: "code",
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "RS256",
      redirect_uri: `${scheme}://${host}${port}/report.html`,
      client_name: "Kheops Report Provider",
      client_uri: "https://kheops.online",
      contacts: ["contact@kheops.online"]
    });
    return respJSON;
  } catch (e) {
    throw e;
  }
}

export function JSON_openidConfiguration(scheme = "http", host, port = "80") {
  port = port === "80" || port === "443" ? "" : ":" + port;
  try {
    const respJSON = JSON.stringify({
      issuer: `${scheme}://${host}${port}`,
      authorization_endpoint: `${scheme}://${host}${port}/authorization`,
      token_endpoint: `${scheme}://${host}${port}/token`
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
