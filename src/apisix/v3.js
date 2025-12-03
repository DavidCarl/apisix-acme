import axios from 'axios'
import config from '../config.js'

/**
 * List all SSL certificates
 * @typedef {{
 *   id: string,
 *   snis: Array<string>,
 *   validity_start?: number,
 *   validity_end?: number
 * }} Item
 * @returns {Promise<Array<Item>>}
 */
async function sslList() {
  const resp = await axios.request({
    method: 'GET',
    headers: { 'X-API-KEY': config.apisix_token },
    url: `${config.apisix_host}/apisix/admin/ssls`
  })

  const { data } = resp
  const results = []

  if (Array.isArray(data.list)) {
    data.list.forEach(node => {
      const item = node.value || {}
      if (!item.snis) return

      results.push({
        id: item.id,
        snis: item.snis,
        validity_start: item.validity_start,
        validity_end: item.validity_end,
      })
    })
  }

  return results
}

/**
 * Create or update an SSL certificate
 * APISIX 3.x only accepts:
 *   - snis
 *   - cert
 *   - key
 * @param {string} id
 * @param {{snis: Array<string>, cert: string, key: string}} data
 * @returns {Promise<void>}
 */
async function setupSsl(id, data) {
  // Strip legacy fields users might accidentally include
  const { snis, cert, key } = data

  const payload = {
    snis,
    cert,
    key
  }

  return axios.request({
    method: 'PUT',
    headers: { 'X-API-KEY': config.apisix_token },
    url: `${config.apisix_host}/apisix/admin/ssls/${id}`,
    data: payload
  })
}

export default {
  sslList,
  setupSsl
}
