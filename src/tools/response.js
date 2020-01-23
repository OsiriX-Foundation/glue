var fs = require("fs"),
  path = require("path");

export function JSON(resp, code, responseJSON) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "origin, content-type, accept, authorization, accept-charset",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods":
      "GET, PATCH, POST, PUT, DELETE, OPTIONS, HEAD",
    "Access-Control-Max-Age": 86400,
    "Content-Type": "application/json"
  };
  resp.writeHead(code, headers);
  resp.write(responseJSON);
  resp.end();
  return;
}
export function textPlain(resp, code, value) {
  resp.writeHead(code, { "Content-Type": "text/plain" });
  resp.write(value);
  resp.end();
  return;
}
export function textXML(resp, code, value) {
  resp.writeHead(code, { "Content-Type": "text/xml" });
  resp.write(value);
  resp.end();
  return;
}
