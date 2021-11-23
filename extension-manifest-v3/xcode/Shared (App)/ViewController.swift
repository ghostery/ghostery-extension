//
//  ViewController.swift
//  Shared (App)
//
//  Created by Krzysztof Jan Modras on 27.09.21.
//

import WebKit
import SafariServices

#if os(iOS)
import UIKit
typealias PlatformViewController = UIViewController
#elseif os(macOS)
import Cocoa
typealias PlatformViewController = NSViewController
#endif

let extensionBundleIdentifier = "com.ghostery.lite.extension"

class ViewController: PlatformViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

#if os(iOS)
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
#endif

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self

#if os(iOS)
        self.webView.scrollView.isScrollEnabled = false
#endif

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
#if os(iOS)
        webView.evaluateJavaScript("show('ios')")
#elseif os(macOS)
        webView.evaluateJavaScript("show('mac')")

        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                webView.evaluateJavaScript("show('mac', \(state.isEnabled))")
            }
        }
#endif
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {

        if (message.body as! String == "open-support") {
            let url = URL(string: "https://www.ghostery.com/support")!
#if os(iOS)
            let safariVC = SFSafariViewController(url: url)
            present(safariVC, animated: true, completion: nil)
#elseif os(macOS)
            NSWorkspace.shared.open(url)
#endif
        }


#if os(macOS)
        if (message.body as! String == "open-preferences") {
            SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
                guard error == nil else {
                    // Insert code to inform the user that something went wrong.
                    return
                }

                DispatchQueue.main.async {
                    NSApplication.shared.terminate(nil)
                }
            }
        }
#endif
    }

}
