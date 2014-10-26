[Deprecated] consumr
==========

Create portable, object-oriented interfaces for remote APIs

## Deprecated

I made this hoping to create a foundation layer for an ORM that could be used both in Node and the browser with eventual Angular integration. At the time it was difficult to get Bluebird promises hooked into the digest cycle and so I instead built one for Angular called [convex](https://github.com/bendrucker/convex) that I use in production use for [Valet.io](http://valet.io). I might revisit the idea at some point in the future. I don't really have a particularly strong need for a REST oriented ORM in Node services that I write whereas it's quite useful in Angular apps.  
