# Chrome Extension Demos

TODO: UPDATE THE LINK

Demos for the talk [Personalised Development Workspace With Chrome Extension]().

List of demos:

- [Generic extension base](./basic)
- [Switching environments and feature toggles](./feature-toggles)
- [Reporting bugs with screen recording](./bug-recording)
- [Debugging events and analytics](./event-analytics)

## Demo organisation

Each demo folder consists of 2 folders:
- `chrome-extension` - the source code for the extension
- `web-page` - the web application that integrates with the extension

To try out the demo, try serve the static pages from the `web-page` folder.
You can use [http-server](https://www.npmjs.com/package/http-server):

```sh
$ http-server feature-toggles/web-page
```

To add the extension into Chrome,
1. Go to `chrome://extensions`
1. Turn on `Developer mode`
1. Select `Load unpacked`
1. Choose the `chrome-extension` folder
1. Done 🎉
