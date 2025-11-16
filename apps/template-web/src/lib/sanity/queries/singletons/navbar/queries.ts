import { defineQuery } from 'next-sanity'
import { buttonsFragment } from '@workspace/sanity-atoms/fragments'

/**
 * Fetch navbar data
 *
 * @param locale - Current locale
 */
export const queryNavbarData = defineQuery(`
  *[_type == "navbar" && language == $locale][0]{
    _id,
    language,
    columns[]{
      _key,
      _type == "navbarColumn" => {
        "type": "column",
        title,
        links[]{
          _key,
          name,
          icon,
          description,
          "openInNewTab": url.openInNewTab,
          "href": select(
            url.type == "internal" => url.internal->slug.current,
            url.type == "external" => url.external,
            url.href
          ),
          "internalType": select(
            url.type == "internal" => url.internal->_type,
            null
          )
        }
      },
      _type == "navbarLink" => {
        "type": "link",
        name,
        description,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.href
        ),
        "internalType": select(
          url.type == "internal" => url.internal->_type,
          null
        )
      }
    },
    ${buttonsFragment},
  }
`)
