//
//  ContentView.swift
//  Ghostery
//
//  Created by Krzysztof Jan Modras on 29.11.21.
//

import SwiftUI
import StoreKit
import OrderedCollections

struct SubscriptionListViewRow: View {

    @EnvironmentObject var storeHelper: StoreHelper
    @State private var subscriptionGroups: OrderedSet<String>?
    @State private var subscriptionInfo: OrderedSet<SubscriptionInfo>?
    var products: [Product]

    var body: some View {
        VStack {
            ForEach(products, id: \.id) { product in
                SubscriptionView(productId: product.id,
                                 displayName: product.displayName,
                                 description: product.description,
                                 price: product.displayPrice,
                                 subscriptionInfo: subscriptionInformation(for: product))
            }
        }
#if os(macOS)
        .padding(.horizontal, 5)
#endif
        .onAppear { getGrouSubscriptionInfo() }
        .onChange(of: storeHelper.purchasedProducts) { _ in getGrouSubscriptionInfo() }
    }

    /// Gets all the subscription groups from the list of subscription products.
    /// For each group, gets the highest subscription level product.
    func getGrouSubscriptionInfo() {
        subscriptionGroups = storeHelper.subscriptionHelper.groups()
        if let groups = subscriptionGroups {
            subscriptionInfo = OrderedSet<SubscriptionInfo>()
            Task.init {
                for group in groups {
                    if let hslp = await storeHelper.subscriptionInfo(for: group) { subscriptionInfo!.append(hslp) }
                }
            }
        }
    }

    /// Gets `SubscriptionInfo` for a product.
    /// - Parameter product: The product.
    /// - Returns: Returns `SubscriptionInfo` for the product if it is the highest service level product
    /// in the group the user is subscribed to. If the user is not subscribed to the product, or it's
    /// not the highest service level product in the group then nil is returned.
    func subscriptionInformation(for product: Product) -> SubscriptionInfo? {
        if let subsInfo = subscriptionInfo {
            for subInfo in subsInfo {
                if let p = subInfo.product, p.id == product.id { return subInfo }
            }
        }

        return nil
    }
}


