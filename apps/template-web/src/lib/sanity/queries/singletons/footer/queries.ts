import { defineQuery } from 'next-sanity'

/**
 * Fetch footer data
 */
export const queryFooterData = defineQuery(`
  *[_type == "footer" && _id == "footer"][0]{
    _id,
    subtitle,
    columns[]{
      _key,
      title,
      links[]{
        _key,
        name,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.href
        ),
        "internalType": select(
          url.type == "internal" => url.internal->_type,
          null
        ),
      }
    }
  }
`)
