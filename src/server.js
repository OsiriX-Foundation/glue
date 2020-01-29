import fs from 'fs'
import http from 'http'
import url from 'url'
import path from 'path'
import * as configuration from './ressources/configuration'
import * as tokens from './ressources/tokens'
import * as responseDefine from './tools/response'
import * as httptools from './tools/httptools'
import { messageNotFound, messageInternalError, messageMissingQuery } from './tools/responsemessages'
import * as responsemessages from './tools/responsemessages'
var qs = require('querystring')
var pem2jwk = require('pem-jwk').pem2jwk

const scheme = process.env.SCHEME !== undefined ? process.env.SCHEME : 'http'
const host = process.env.HOST !== undefined ? process.env.HOST : '129.194.217.3'
const port = process.env.PORT !== undefined ? process.env.PORT : '80'
const hostname = `${host}${port !== '80' || port !== '443' ? port : ''}`
const routerBaseName = process.env.BASE_NAME !== undefined ? process.env.BASE_NAME : '/test';

var privKey = fs.readFileSync('keys/privkey.pem', 'ascii')
var jwk = pem2jwk(privKey)
var jwkID = 0

server()

function server() {
  http
    .createServer(function(request, response) {
      console.log(`${request.method} - ${request.url}`)
      var uri = url.parse(request.url).pathname,
        query = `?${url.parse(request.url).query}`,
        filename = path.join(process.cwd(), '/html' + uri)
      switch (uri) {
        case '/.well-known':
          try {
            const res = configuration.JSON_wellknown(scheme, hostname, routerBaseName)
            responseDefine.JSON(response, 200, res)
          } catch (err) {
            console.log(err)
            responseDefine.JSON(response, messageInternalError.status, JSON.stringify(messageInternalError))
          }
          break
        case '/.well-known/kheops-configuration':
          try {
            const res = configuration.JSON_kheopsConfiguration(scheme, hostname, routerBaseName)
            responseDefine.JSON(response, 200, res)
          } catch (err) {
            console.log(err)
            responseDefine.JSON(response, messageInternalError.status, JSON.stringify(messageInternalError))
          }
          break
        case '/.well-known/openid-configuration':
          try {
            const res = configuration.JSON_openidConfiguration(scheme, hostname, routerBaseName)
            responseDefine.JSON(response, 200, res)
          } catch (err) {
            console.log(err)
            responseDefine.JSON(response, messageInternalError.status, JSON.stringify(messageInternalError))
          }
          break
        case '/authorization':
          try {
            let redirect_uri_ohif = httptools.getParameterByName('redirect_uri', query)
            let state = httptools.getParameterByName('state', query)
            const authorizationCode = httptools.getParameterByName('login_hint', query)
            if (state === null || authorizationCode === null || state === null) {
              throw messageMissingQuery
            }
            redirect_uri_ohif = `${redirect_uri_ohif}?code=${authorizationCode}&state=${state}`
            const headersAuth = {
              Location: redirect_uri_ohif,
            }
            response.writeHead(303, headersAuth)
            response.end()
          } catch (err) {
            const message = responsemessages.messageGenerate(err)
            console.log(err)
            responseDefine.JSON(response, message.status, JSON.stringify(message))
          }
          break
        case '/token':
          const currentConfiguration = {}
          currentConfiguration.conf_uri = 'https://demo.kheops.online/api/token'
          currentConfiguration.token_endpoint = 'https://demo.kheops.online/api/token'
          const clientID = 'igl7l1gnz5Wth9Lg7GgpAj'
          if (request.method == 'POST') {
            var body = ''

            request.on('data', function(data) {
              body += data
              if (body.length > 1e6) request.connection.destroy()
            })

            request.on('end', function() {
              var post = qs.parse(body)
              tokens
                .getAuthenticationJWT(currentConfiguration, privKey, clientID, jwkID, post.code, `${scheme}://${hostname}${routerBaseName}/report.html`)
                .then(res => {
                  responseDefine.JSON(response, 200, JSON.stringify(res.data))
                  return
                })
                .catch(err => {
                  const error = err.response !== undefined ? err.response : err
                  const message = responsemessages.messageGenerate(error)
                  console.log(err)
                  responseDefine.JSON(response, message.status, JSON.stringify(message))
                })
            })
          }
          break
        case '/certs':
          try {
            const res = configuration.JSON_cert(jwk)
            responseDefine.JSON(response, 200, res)
          } catch (err) {
            console.log(err)
            responseDefine.JSON(response, messageInternalError.status, JSON.stringify(messageInternalError))
          }
          break

        case '/report.html':
          try {
            const authorizationCode = httptools.getParameterByName('code', query)
            const studyUID = httptools.getParameterByName('studyUID', query)
            if (authorizationCode === null || studyUID === null) {
              throw messageMissingQuery
            }
            const headers = {
              Location: `http://127.0.0.1:3000/login?iss=${encodeURIComponent(`${scheme}://${hostname}`)}&login_hint=${authorizationCode}&target_link_uri=${encodeURIComponent(`http://127.0.0.1:3000/viewer/${studyUID}`)}`,
            }
            response.writeHead(303, headers)
            response.end()
          } catch (err) {
            console.log(err)
            const error = err.response !== undefined ? err.response : err
            const message = responsemessages.messageGenerate(error)
            responseDefine.JSON(response, message.status, JSON.stringify(message))
          }
          break
        default:
          responseDefine.JSON(response, messageNotFound.status, JSON.stringify(messageNotFound))
      }
    })
    .listen(parseInt(port, 10))
}
