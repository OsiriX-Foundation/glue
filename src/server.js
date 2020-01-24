import fs from "fs";
import http from "http";
import url from "url";
import path from "path";
import axios from "axios";
import * as configuration from "./ressources/configuration";
import * as tokens from "./ressources/tokens";
import * as responseDefine from "./tools/response";
import * as httptools from "./tools/httptools";
import {
  messageNotFound,
  messageInternalError
} from "./tools/responsemessages";
var qs = require("querystring");
var pem2jwk = require("pem-jwk").pem2jwk;

const scheme = process.env.SCHEME !== undefined ? process.env.SCHEME : "http";
const host =
  process.env.HOST !== undefined ? process.env.HOST : "129.194.217.112";
const port = process.env.PORT !== undefined ? process.env.PORT : "80";

var privKey = fs.readFileSync("keys/privkey.pem", "ascii");
var jwk = pem2jwk(privKey);
var jwkID = 0;

server();

function server() {
  http
    .createServer(function(request, response) {
      console.log(`${request.method} - ${request.url}`);
      var uri = url.parse(request.url).pathname,
        query = `?${url.parse(request.url).query}`,
        filename = path.join(process.cwd(), "/html" + uri);
      switch (uri) {
        case "/.well-known":
          try {
            const res = configuration.JSON_wellknown(scheme, host, port);
            responseDefine.JSON(response, 200, res);
          } catch (err) {
            responseDefine.JSON(
              response,
              500,
              JSON.stringify(messageInternalError)
            );
            console.log(err);
          }
          break;
        case "/.well-known/kheops-configuration":
          try {
            const res = configuration.JSON_kheopsConfiguration(
              scheme,
              host,
              port
            );
            responseDefine.JSON(response, 200, res);
          } catch (err) {
            responseDefine.JSON(
              response,
              500,
              JSON.stringify(messageInternalError)
            );
            console.log(err);
          }
          break;
        case "/.well-known/openid-configuration":
          try {
            const res = configuration.JSON_openidConfiguration(
              scheme,
              host,
              port
            );
            responseDefine.JSON(response, 200, res);
          } catch (err) {
            responseDefine.JSON(
              response,
              500,
              JSON.stringify(messageInternalError)
            );
            console.log(err);
          }
          break;
        case "/authorization":
          try {
            let redirect_uri_ohif = httptools.getParameterByName(
              "redirect_uri",
              query
            );
            let state = httptools.getParameterByName("state", query);
            const authorizationCode = httptools.getParameterByName("login_hint", query);
            redirect_uri_ohif = `${redirect_uri_ohif}?code=${authorizationCode}&state=${state}`;
            const headersAuth = {
              Location: redirect_uri_ohif
            };
            response.writeHead(303, headersAuth);
            // response.write(responseJSON);
            response.end();
          } catch (err) {
            responseDefine.JSON(
              response,
              500,
              JSON.stringify(messageInternalError)
            );
            console.log(err);
          }
          break;
        case "/token":
          const currentConfiguration = {};
          currentConfiguration.conf_uri =
            "https://demo.kheops.online/api/token";
          currentConfiguration.token_endpoint =
            "https://demo.kheops.online/api/token";
          const clientID = "igl7l1gnz5Wth9Lg7GgpAj";
          if (request.method == "POST") {
            var body = "";

            request.on("data", function(data) {
              body += data;
              if (body.length > 1e6) request.connection.destroy();
            });

            request.on("end", function() {
              var post = qs.parse(body);
              tokens
                .getAuthenticationJWT(
                  currentConfiguration,
                  privKey,
                  clientID,
                  jwkID,
                  post.code,
                  `${scheme}://${host}/report.html`
                )
                .then(res => {
                  responseDefine.JSON(response, 200, JSON.stringify(res.data));
                  return;
                })
                .catch(err => {
                  if (err.response !== undefined) {
                    console.log(err.response.status);
                    console.log(err.response.data);
                  } else {
                    console.log(err);
                  }
                });
            });
          }
          break;
        case "/certs":
          try {
            const res = configuration.JSON_cert(jwk);
            responseDefine.JSON(response, 200, res);
          } catch (err) {
            responseDefine.JSON(
              response,
              500,
              JSON.stringify(messageInternalError)
            );
            console.log(err);
          }
          break;

        case "/report.html":
          const authorizationCode = httptools.getParameterByName("code", query);
          const studyUID = httptools.getParameterByName("studyUID", query);
          const headers = {
            // Location: 'http://127.0.0.1:3000'
            Location: `http://127.0.0.1:3000/login?iss=127.0.0.1&login_hint=${authorizationCode}&target_link_uri=${encodeURIComponent(`http://127.0.0.1:3000/viewer/${studyUID}`)}`
          };
          response.writeHead(303, headers);
          response.end();
          break;
        default:
          responseDefine.JSON(response, 404, JSON.stringify(messageNotFound));
      }
    })
    .listen(parseInt(port, 10));
}
