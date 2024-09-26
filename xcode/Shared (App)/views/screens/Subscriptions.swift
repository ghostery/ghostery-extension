//
//  Subscriptions.swift
//  Ghostery
//
//  Created by Krzysztof Jan Modras on 29.11.21.
//

import SwiftUI
import StoreKit

struct Subscriptions: View {
    var openInWebView: (URL) -> Void
    var closeSubscriptions: () -> Void

    @State var isSubscribed = false;
    @EnvironmentObject var storeHelper: StoreHelper

    var body: some View {
        VStack() {
            HStack(spacing: 20) {
                Button(action: closeSubscriptions) {
                    HStack {
                        Image(systemName: "arrow.left")
                        Text("Back")
                    }
                }

                Spacer()
                Button(action: restorePurchases) {
                    HStack {
                        Text("Restore donation")
                    }
                }
            }
#if os(macOS)
            .padding(.vertical)
#endif
                .frame(maxWidth: .infinity, alignment: .topLeading)


            Text("Contribute to Ghostery and support a clean, fast, and open web.")
                .multilineTextAlignment(.center)
                .padding()
            Text("Choose how to support Ghostery:")
                .font(.headline)
                .padding()

            VStack {
                if storeHelper.hasProducts {
                    if let subscriptions = storeHelper.subscriptionProducts {
                        SubscriptionListViewRow(products: subscriptions)
                    }
                } else {
                    Text("No donations available")
                        .font(.title)
                        .foregroundColor(.red)
                }
            }

            Text("""
            • By donating to Ghostery, you are supporting our mission. Thank you for believing in us!

            • For now donating does not unlock any additional features, but it does help us.

            • We are working on implementing more privacy features and benefits on the Apple platform.

            • You will soon be able to link your Apple subscription to your Ghostery account and unlock additional features on other platforms.
            """)
                .font(.footnote)
                .lineLimit(nil)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)

            HStack {
                Button("EULA") {
                    openInWebView(URL(string: "https://www.ghostery.com/privacy/ghostery-subscription-plans-and-products-end-user-license-agreement")!)
                }
                    .buttonStyle(.borderless)
                    .foregroundColor(.blue)
                    .padding()


                Button("Terms of Use") {
                    openInWebView(URL(string: "https://www.ghostery.com/privacy/ghostery-terms-and-conditions")!)
                }
                    .buttonStyle(.borderless)
                    .foregroundColor(.blue)
                    .padding()

                Button("Privacy Policy") {
                    openInWebView(URL(string: "https://www.ghostery.com/privacy/ghostery-plans-and-products-privacy-policy")!)
                }
                    .buttonStyle(.borderless)
                    .foregroundColor(.blue)
                    .padding()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.horizontal)
        .onAppear { getSubscriptionInfo() }
    }

    /// Restores previous user purchases. With StoreKit2 this is normally not necessary and should only be
    /// done in response to explicit user action. Will result in the user having to authenticate with the
    /// App Store.
    private func restorePurchases() {
        Task.init { try? await AppStore.sync() }
    }

    private func getSubscriptionInfo() {
        Task.init {
            let entitlements = await storeHelper.currentEntitlements()
            self.isSubscribed = !entitlements.isEmpty
        }
    }
}

struct Subscriptions_Previews: PreviewProvider {
    static var previews: some View {
        Subscriptions(openInWebView: {_ in }, closeSubscriptions: {})
    }
}
