//
//  SafariWebExtensionHandler.swift
//  Shared (Extension)
//
//  Created by Krzysztof Jan Modras on 27.09.21.
//

import SafariServices
import os.log

let SFExtensionMessageKey = "message"

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems[0] as! NSExtensionItem
        let message = item.userInfo?[SFExtensionMessageKey]
        os_log(.default, "Received message from browser.runtime.sendNativeMessage: %@", message as! CVarArg)

        let response = NSExtensionItem()
        response.userInfo = [ SFExtensionMessageKey: [ "Response to": message ] ]

        context.completeRequest(returningItems: [response], completionHandler: nil)
    }

}
