import { defineQuery } from 'next-sanity'

export const queryRedirects = defineQuery(`
  *[_type == "redirect" && status == "active" && defined(source.current) && defined(destination.current)]{
    "source":source.current, 
    "destination":destination.current, 
    "permanent" : permanent == "true"
  }
`)
