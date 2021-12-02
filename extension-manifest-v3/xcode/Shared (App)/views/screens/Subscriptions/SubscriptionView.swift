//
//  ContentView.swift
//  Ghostery
//
//  Created by Krzysztof Jan Modras on 29.11.21.
//

import SwiftUI

struct SubscriptionView: View {

    @EnvironmentObject var storeHelper: StoreHelper
    @State var purchaseState: PurchaseState = .unknown

    var productId: ProductId
    var displayName: String
    var description: String
    var price: String
    var subscriptionInfo: SubscriptionInfo?  // If non-nil then the product is the highest service level product the user is subscribed to in the subscription group

    var body: some View {
        VStack {
            HStack {
                VStack {
                    Text(displayName)
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .foregroundColor(.blue)
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                Spacer()

                PurchaseButton(purchaseState: $purchaseState, productId: productId, price: price)
            }

            if purchaseState == .purchased, subscriptionInfo != nil {
                SubscriptionInfoView(subscriptionInfo: subscriptionInfo!)
            }
        }
        .padding(.vertical)
        .onAppear {
            Task.init { await purchaseState(for: productId) }
        }
        .onChange(of: storeHelper.purchasedProducts) { _ in
            Task.init { await purchaseState(for: productId) }
        }
    }

    func purchaseState(for productId: ProductId) async {
        let purchased = (try? await storeHelper.isPurchased(productId: productId)) ?? false
        purchaseState = purchased ? .purchased : .unknown
    }
}
