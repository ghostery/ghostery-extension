//
//  SafariWebExtensionHandler.swift
//  Ghostery
//
//  Native part of the Safari extension, which Safari requires. The extension
//  doesn't send native messages, so a request is completed without a reply.
//

import SafariServices

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
  func beginRequest(with context: NSExtensionContext) {
    context.completeRequest(returningItems: nil, completionHandler: nil)
  }
}
